# ! /bin/sh

basepath=$(cd `dirname $0`; pwd)

while true
do
    procnum=`ps -ef|grep "ts-node index.ts"|grep -v grep|wc -l`
    if [ $procnum -eq 0 ]
    then
        cd /home/projects/wechatry/wwc-wechaty; ./ts-node index.ts
        echo `date +%Y-%m-%d` `date +%H:%M:%S`  "restart ts-node index.ts" >>$basepath/shell.log
    fi
    sleep 1
done