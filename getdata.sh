#!/bin/bash
##################################################
# Nminus [kWh]
# Nplus  [kWh]
# E      [Wh]
# P      [W]
# Bminus [W]
# Bplus  [W]
# B      [%]
# Tin    [°C]
# Tout   [°C]
##################################################
CNT=/dev/ttyUSB0
BUF=/tmp/cnt
SBURI="https://192.168.1.26/dyn/getDashValues.json"
SEURI="https://monitoringapi.solaredge.com/site/\
1588788/overview?api_key=35AWMO9GK13MT2VE8ZF0YLVJ5IK7RCSA\
&format=application/json"
##################################################
DIGITEMP=digitemp_DS9097
DIGITEMP_CFG=/etc/digitemp.conf
##################################################
export LANG='de_DE.UTF-8'
##################################################
get_data() {
# get data # -------------------------------------
cat $CNT > $BUF &2>&1
ID=$!
sleep 2
kill $ID >/dev/null 2>&1
# get counter # ----------------------------------
RET=`sed 's/[^[:print:]]//g' $BUF | awk '
BEGIN {
  state = 0
}
/1-0:1.8.0\*255\(/ {
  if(state == 0) {
    gsub(".*\(0*", "")
    gsub("\*.*", "")
    C180 = $1
  }
  state++
 #exit
}
/1-0:2.8.0\*255\(/ {
  if(state == 1) {
    gsub(".*\(0*", "")
    gsub("\*.*", "")
    C280 = $1
  }
  state++
}
END {
  printf("%i:%i", C180 * 1000, C280 * 1000)
}
'
`
}
##################################################
get_temp() {
  Tin=`digitemp_DS9097 -a -q -o"%.2C"`
#  RET=$RET":${T//$'\n'/:}"
  Tout=`node -pe 'JSON.parse(process.argv[1]).main.temp' "$(cat wm.json)"`
  RET="$RET:$Tin:$Tout"
#  RET=$RET":20:20"
}
##################################################
get_store() {
  JS=`curl -k -s $SBURI`
    BATP=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6100_00295A00\"][\"7\"][0].val"`
    BAT1=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6100_00496900\"][\"7\"][0].val"`   
    BAT2=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6100_00496A00\"][\"7\"][0].val"`
#     OUT=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6100_40463600\"][\"7\"][0].val"`
#   ALLIN=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6400_00496700\"][\"7\"][0].val"`
#  ALLOUT=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6400_00260100\"][\"7\"][0].val"`   
#   NETZ1=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6100_40463600\"][\"7\"][0].val"`
#   NETZ2=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"][\"6100_40463700\"][\"7\"][0].val"`
  RET="${RET}:${BAT2}:${BAT1}:${BATP}"
}
##################################################
get_pv() {
  JS=`curl -k -s $SEURI`
  E=`echo "$JS" | jq ".overview.lifeTimeData.energy"`
  P=`echo "$JS" | jq ".overview.currentPower.power"`
  RET="${RET}:${E}:${P}"
}
##################################################
get_all() {
  get_data
  get_pv
  get_store
  get_temp
}
##################################################

##################################################
use ()
{
 PRG=`basename $0`
 cat <<ENDString
use: $PRG [i|u|g] FILE [IMG1 IMG2]

 -i init database FILE, if FILE exists then rewrite
 -u update database FILE
 -g generate images FILE IMG1 IMG2

ENDString
  exit 0
}
##################################################
init ()
{
  START=`date "+%Y-%m-%d 00:00:00"`
  START=`date "+%s" -d "$START"`
  rm -f $1

  rrdtool create $1 \
    --start $START --step 300 \
    DS:Nminus:COUNTER:600:0:U \
    DS:Nplus:COUNTER:600:0:U \
    DS:E:COUNTER:600:0:U \
    DS:P:GAUGE:600:0:U \
    DS:Bminus:GAUGE:600:0:U \
    DS:Bplus:GAUGE:600:0:U \
    DS:B:GAUGE:600:0:U \
    DS:Tin:GAUGE:600:-50:100 \
    DS:Tout:GAUGE:600:-50:50 \
    RRA:AVERAGE:0.5:1:576 \
    RRA:AVERAGE:0.5:12:7440 \
    RRA:AVERAGE:0.5:288:2880 \
    RRA:MIN:0.5:1:576 \
    RRA:MIN:0.5:12:7440 \
    RRA:MIN:0.5:288:2880 \
    RRA:MAX:0.5:1:576 \
    RRA:MAX:0.5:12:7440 \
    RRA:MAX:0.5:288:2880
  exit $?

}
################################################## 
update ()
{
  get_all
  echo -e `date "+%Y-%m-%d %H:%M:%S"`"@$RET" > "$1".txt
  rrdtool update $1 "N:$RET"
  if [[ $? != 0 ]]
  then
    echo ERROR
  fi
  exit $?
}
##################################################
generate ()
{
  T=`rrdtool info /home/Dropbox/www/michi/digitemp.rrd |grep last_ds|grep IN`
  T=${T/ds[IN\]\.last_ds = \"/}
  T=${T/\"/}
#  T=${T/ds[OUT\]\.last_ds = / Grad;Außen: }" Grad"

  D=`date +"%d.%m.%Y %H:%M:%S"`
  OUT_LO=16
  OUT_HI=20
#  nice -n 19 rrdtool graph $2 -a PNG -b 1024  -A \
  nice -n 19 rrdtool graph $2 -a PNG -b 1024 --start -31104000 -A \
    -l 16 -u 22 -t "Innen Temperatur $D" --vertical-label "Grad Celsius" -w 600 -h 200 \
    DEF:g1=$1:IN:AVERAGE \
    DEF:gmin=$1:IN:MIN \
    DEF:gmax=$1:IN:MAX \
    VDEF:g1a=g1,LAST \
    VDEF:gdurch=g1,AVERAGE \
    VDEF:gmina=gmin,MINIMUM \
    VDEF:gmaxa=gmax,MAXIMUM \
    CDEF:blau=g1,$OUT_LO,GT,UNKN,g1,IF \
    CDEF:rot=g1,$OUT_HI,LT,UNKN,g1,IF \
    CDEF:gruen=g1 \
    LINE2:gruen#00ff00:"zwischen $OUT_LO und $OUT_HI °C" \
    LINE2:blau#0000ff:"unter $OUT_LO °C" \
    LINE2:rot#ff0000:"über $OUT_HI °C\n" \
    GPRINT:g1a:"aktuell\:%5.2lf/$T °C" \
    GPRINT:gdurch:"Durchschnitt\:%5.2lf °C" \
    GPRINT:gmina:"tiefste\:%5.2lf °C" \
    GPRINT:gmaxa:"höchste\:%5.2lf °C" > /dev/null

  T=`rrdtool info /home/Dropbox/www/michi/digitemp.rrd |grep last_ds|grep OUT`
  T=${T/ds[OUT\]\.last_ds = \"/}
  T=${T/\"/}
  OUT_LO=0
  OUT_HI=10
  nice -n 19 rrdtool graph $3 -a PNG -b 1024 --start -31104000 -A \
    -l -11 -u 24 -t "Außen Temperatur $D" --vertical-label "Grad Celsius" -w 600 -h 200 \
    DEF:g1=$1:OUT:AVERAGE \
    DEF:gmin=$1:OUT:MIN \
    DEF:gmax=$1:OUT:MAX \
    VDEF:g1a=g1,LAST \
    VDEF:gdurch=g1,AVERAGE \
    VDEF:gmina=gmin,MINIMUM \
    VDEF:gmaxa=gmax,MAXIMUM \
    CDEF:blau=g1,$OUT_LO,GT,UNKN,g1,IF \
    CDEF:rot=g1,$OUT_HI,LT,UNKN,g1,IF \
    CDEF:gruen=g1 \
    LINE2:gruen#00ff00:"zwischen $OUT_LO und $OUT_HI °C" \
    LINE2:blau#0000ff:"unter $OUT_LO °C" \
    LINE2:rot#ff0000:"über $OUT_HI °C\n" \
    GPRINT:g1a:"aktuell\:%5.2lf/$T °C" \
    GPRINT:gdurch:"Durchschnitt\:%5.2lf °C" \
    GPRINT:gmina:"tiefste\:%5.2lf °C" \
    GPRINT:gmaxa:"höchste\:%5.2lf °C" > /dev/null
  exit $?
#    CDEF:gruen=g1,$OUT_LO,LT,UNKN,g1,$OUT_HI,GT,UNKN,g1,IF,IF \

}
##################################################
DIR=`dirname "$0"`
cd $DIR

while getopts ":i:u:g:h" OPTION
  do
  case $OPTION in 
    i) init $OPTARG;;
    u) update $OPTARG;;
    g) generate $OPTARG $3 $4;;
  esac
done
use
##################################################
