#!/bin/bash
##################################################
# C180   [kWh]
# C280   [kWh]
# E      [kWh]
# P      [kW]
# BAT1   [kW]
# BAT2   [kW]
# BATP   [%]
# T      [°C]
##################################################
ttyCNT=/dev/ttyUSB0
sbURI="https://192.168.1.26/dyn/getDashValues.json"
seURI="https://monitoringapi.solaredge.com/site/\
1588788/overview?api_key=35AWMO9GK13MT2VE8ZF0YLVJ5IK7RCSA\
&format=application/json"
WM=/home/pi/counter/wm.json

FRM=`cat <<ENDString
C180 %8.3f kWh
C280 %8.3f kWh
E    %8.3f kWh
P    %8.3f kW
BAT1 %8.3f kW
BAT2 %8.3f kW
BATP %8.3f %%
T    %8.3f °C
ENDString`
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
  BAT1=0.000
  BAT2=502.000
  BATP=92.0
  T=-6.77
}
##################################################
testData() {
  echo "Wait please..."
  fetchData
  #dummyData
  print "$FRM"\
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
