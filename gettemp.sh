#!/bin/bash
# Hole Temperaturwerte von den Sensoren und speichere sie in RR Datenbank
#
# Pfad zu digitemp
DIGITEMP=/usr/bin/digitemp_DS9097
# DS Namen der vorhandenen Sensoren
SENSORS=temp0:temp1
# Wechsle ins Verzeichnis mit Datenbank und .digitemprc
cd /home/pi/digitemp

data=`$DIGITEMP -a -q -o 2 | awk 'NF>1 {OFS=":"; $1="N"; print}'`
if [ -n "$data" ] ; then
        rrdtool update temperature.rrd -t $SENSORS $data
fi
