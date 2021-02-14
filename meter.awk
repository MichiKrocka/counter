#!/usr/bin/gawk -f
BEGIN {
  RS = "\n\n"
  FS = "[()*]"
}
/2\.8\.0/ {
  printf "%.3f\n", $3 > "2.8.0.txt"
  close("2.8.0.txt")
}
/1\.8\.0/ {
  printf "%.3f\n", $3 > "1.8.0.txt"
  close("1.8.0.txt")
}
