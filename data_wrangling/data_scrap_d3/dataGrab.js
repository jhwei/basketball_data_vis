var request = require('request');
var dl = require('datalib');
var d3 = require('d3');
var fs = require("fs");

var shot_chart_url = 'http://stats.nba.com/stats/shotchartdetail?Period=0&VsConference=&LeagueID=00&LastNGames=0&TeamID=0&Position=&Location=&Outcome=&ContextMeasure=FGA&DateFrom=&StartPeriod=&DateTo=&OpponentTeamID=0&ContextFilter=&RangeType=&Season=1999-00&AheadBehind=&PlayerID=977&EndRange=&VsDivision=&PointDiff=&RookieYear=&GameSegment=&Month=0&ClutchTime=&StartRange=&EndPeriod=&SeasonType=Regular+Season&SeasonSegment=&GameID=&PlayerPosition=';



request.get(shot_chart_url, function(err, res, body){
    var data = JSON.parse(body);


    var playerArray = data.resultSets[0].rowSet;

    var x = [];
    var y = [];
    var made = [];
    var attempts = [];
    playerArray.forEach(function(a){

       x.push(a[a.length-7]);
        y.push(a[a.length-6]);
        made.push(a[a.length-4]);
        attempts.push(a[a.length-5]);

    });
    //
    var tenderData = [];
    for(var i = 0; i < playerArray.length; i++){
        tenderData.push({"x":Math.ceil((x[i]+243)/10),
            "y": Math.ceil((y[i]+17)/9),
            "made": made[i],
            "attempts": attempts[i]});
    };

    var coll = d3.nest()
        .key(function(d) {return [d.x, d.y]; })
        .rollup(function(v){return{
            made: d3.sum(v, function(d) {return d.made}),
            attempts: d3.sum(v, function(d){return d.attempts}),
            shootingPercentage:  d3.sum(v, function(d) {return d.made})/d3.sum(v, function(d){return d.attempts})
        }})
        .entries(tenderData);

   // console.log(coll);

    var shotper = [];
    var finalData = [];
    var z = [];
    coll.forEach(function(a){
        a.key = JSON.parse("[" + a.key + "]");
        z.push(a.value.shootingPercentage);
    });

    var meanShot = dl.mean(z);
    var shotSTDV = dl.stdev(z);

    coll.forEach(function(a){
        var k = (a.value.shootingPercentage - meanShot)/shotSTDV;
        finalData.push({"x": a.key[0], "y": a.key[1], "z": k, "made": a.value.made, "attempts": a.value.attempts})
    });

   // console.log(finalData);

 //   console.log(dl.mean(shotper));
   // console.log(dl.stdev(shotper));
  //  console.log(dl.variance(shotper));

  //  console.log(data.resultSets[0].rowSet);
  //  console.log(data.resultSets[0].headers)
  //  console.log(tenderData);

//    console.log(dl.print.summary(tenderData));

var json_sting=JSON.stringify(finalData);
console.log("准备写入文件");
fs.writeFile('data.json', json_sting,  function(err) {
   if (err) {
       return console.error(err);
   }
   console.log("数据写入成功！");
});

});