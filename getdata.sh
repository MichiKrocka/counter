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
ttyCNT=/dev/ttyUSB0
sbURI="https://192.168.1.26/dyn/getDashValues.json"
seURI="https://monitoringapi.solaredge.com/site/\
1588788/overview?api_key=35AWMO9GK13MT2VE8ZF0YLVJ5IK7RCSA\
&format=application/json"
WM=/home/pi/counter/wm.json
##################################################
export LANG=C
##################################################
fetchData() {
  # 1.8.0 ########################################
  C180=`cat $ttyCNT | gawk '
  BEGIN {
    RS = "\n\n"
    FS = "[()*]"
  }
  /1\.8\.0/ {
    printf "%.3f\n", $3
    close("2.8.0.txt")
    exit 0
  }
  '`
  # 2.8.0 ########################################
  C280=`cat $ttyCNT | gawk '
  BEGIN {
    RS = "\n\n"
    FS = "[()*]"
  }
  /2\.8\.0/ {
    printf "%.3f\n", $3
    close("2.8.0.txt")
    exit 0
  }
  '`
  # BATTERY ######################################
  JS=`curl -k -s $sbURI`
  BATP=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"]\
  [\"6100_00295A00\"][\"7\"][0].val"`
  BAT1=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"]\
  [\"6100_00496900\"][\"7\"][0].val"`
  BAT1=`printf "%.3f" "$((BAT1))e-3"`
  BAT2=`echo  "{${JS#*\{}" | jq ".result[\"0169-B33B7C84\"]\
  [\"6100_00496A00\"][\"7\"][0].val"`
  BAT2=`printf "%.3f" "$((BAT2))e-3"`
  # T ############################################
  T=`cat $WM | jq ".main.temp"`
  # P 6 E ########################################
  JS=`curl -k -s $seURI`
  E=`echo "$JS" | jq ".overview.lifeTimeData.energy"`
  E=`printf "%.3f" "$((E))e-3"`
  P=`echo "$JS" | jq ".overview.currentPower.power"`
  P=`printf "%.3f" "$((P))e-3"`
}
##################################################
dummyData(){
  C180=7311.296
  C280=3936.994
  E=6858.274
  P=222.000
  BATP=92.0
  BAT1=0.000
  BAT2=502.000
  T=-6.77
}
##################################################
testData() {
  echo "Wait please..."
  fetchData
  #dummyData
  printf "C180 %8.3f kWh\nC280 %8.3f kWh\nE    %8.3f kWh\nP    %8.3f kW\nBAT1 %8.3f kW\nBAT2 %8.3f kW\nBATP %8.3f %%\nT    %8.3f °C\n"\
    $C180 $C280 $E $P $BAT1 $BAT2 $BATP $T
  exit 0
}
##################################################
initData(){
  START=`date "+%Y-%m-%d 00:00:00"`
  START=`date "+%s" -d "$START"`
  rm -f $1

  rrdtool create $1 \
    --start $START --step 300 \
    DS:C180:GAUGE:600:0:U \
    DS:C280:GAUGE:600:0:U \
    DS:E:GAUGE:600:0:U \
    DS:P:GAUGE:600:0:U \
    DS:BAT1:GAUGE:600:0:U \
    DS:BAT2:GAUGE:600:0:U \
    DS:BATP:GAUGE:600:0:U \
    DS:T:GAUGE:600:-100:100 \
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
updateData(){
  fetchData
  #dummyData
  REC=`printf "@%.3f:%.3f:%.3f:%.3f:%.3f:%.3f:%.1f:%.2f"\
    $C180 $C280 $E $P $BAT1 $BAT2 $BATP $T`
  echo `date "+%Y-%m-%d %H:%M:%S"`$REC > "$1".txt
  rrdtool update $1 "N+0:$REC"
  if [[ $? != 0 ]]
  then
    echo ERROR
  fi
  exit $?
}
##################################################
use ()
{
 PRG=`basename $0`
 cat <<ENDString
use: $PRG [t|i|u|g] FILE [IMG1 IMG2]

 -t test for data
 -i init database FILE, if FILE exists then rewrite
 -u update database FILE
 -g generate images FILE IMG1 IMG2

ENDString
  exit 0
}
##################################################
DIR=`dirname "$0"`
cd $DIR
while getopts "ti:u:g:h" OPTION
  do
  case $OPTION in
    t) testData;;
    i) initData   $OPTARG;;
    u) updateData $OPTARG;;
    g) echo g;;#generate $OPTARG $3 $4;;
  esac
done
use
##################################################




exit
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
