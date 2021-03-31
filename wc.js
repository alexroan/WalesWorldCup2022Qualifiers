$(window).ready(function(){

	LoadResults(true);

	//When score predictions change
	$(document).on("change keyup paste", "input", function(){
		LoadResults(false);
		AddPredictionsToResults();
		ConstructTable();
	});

});

var results = null;
var teams = {
	"belg":"Belgium",
	"wale":"Wales",
	"bela":"Belarus",
	"esto":"Estonia",
	"czec":"Czech Republic"
};

function LoadResults(construct){
	$.getJSON("results.json", function(data){
		results = data;
		if(construct == true){
			ConstructFixtures();
			ConstructTable();
		}
	});
}

function AddPredictionsToResults(){
	$("div.fixture").each(function(i){
		var inputs = $(this).find("input");

		var homeScore = $(inputs[0]).val();
		var awayScore = $(inputs[1]).val();

		if(homeScore != "" && awayScore != ""){
			var scoreId = $(inputs[0]).attr("id").split("-");
			var homeTeam = teams[scoreId[0]];
			var awayTeam = teams[scoreId[1]];
			var prediction = {
				Home:{
					Name: homeTeam,
					Score: parseInt(homeScore)
				},
				Away:{
					Name: awayTeam,
					Score: parseInt(awayScore)
				}
			};
			results.push(prediction);
		}
	});
}

function ConstructFixtures(){
	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		var home = result.Home;
		var away = result.Away;

		if ( (!('Score' in home)) || (!('Score' in away))){
			PrintFixture(home, away)
		}
	}
}

function ConstructTable(){	
	var pointsTable = {
		"Belgium": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Wales": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Belarus": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Estonia": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Czech Republic": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0}
	};

	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		var home = result.Home;
		var away = result.Away;

		if ( (!('Score' in home)) || (!('Score' in away))){
			continue;
		}

		//Home team Played, GF, GA and GD
		pointsTable[home.Name].P++;
		pointsTable[home.Name].GF += home.Score;
		pointsTable[home.Name].GA += away.Score;
		pointsTable[home.Name].GD = pointsTable[home.Name].GF - pointsTable[home.Name].GA;
		//Away team Played, GF, GA and GD
		pointsTable[away.Name].P++;
		pointsTable[away.Name].GF += away.Score;
		pointsTable[away.Name].GA += home.Score;
		pointsTable[away.Name].GD = pointsTable[away.Name].GF - pointsTable[away.Name].GA;

		//W,D,L
		if(home.Score > away.Score){
			pointsTable[home.Name].W++;
			pointsTable[away.Name].L++;
		}
		else if (home.Score < away.Score){
			pointsTable[away.Name].W++;
			pointsTable[home.Name].L++;
		}
		else{
			pointsTable[home.Name].D++;
			pointsTable[away.Name].D++;
		}

		pointsTable[home.Name].Pts = (pointsTable[home.Name].W * 3) + pointsTable[home.Name].D;
		pointsTable[away.Name].Pts = (pointsTable[away.Name].W * 3) + pointsTable[away.Name].D;
	}	
	//console.log(pointsTable);
	PrintTable(pointsTable);
}

function PrintFixture(home, away){
	var $form = $("#predictions-form");
	home3 = home.Name.toLowerCase().substring(0,4);
	away3 = away.Name.toLowerCase().substring(0,4);

	homeCode = home3 + "-" + away3 + "-" + home3;
	awayCode = home3 + "-" + away3 + "-" + away3;
	
	content = "<div class=\"form-group fixture\">"
			+ "<div class=\"col-xs-3\">"
			+ "<label class=\"control-label\">"+home.Name+"</label>"
			+ "</div>"
			+ "<div class=\"col-xs-6\">"
			+ "<div class=\"col-xs-6\">"
			+ "<input type=\"number\" min=\"0\" class=\"form-control input-sm\" id=\""+homeCode+"\">"
			+ "</div>"
			+ "<div class=\"col-xs-6\">"
			+ "<input type=\"number\" min=\"0\" class=\"form-control input-sm\" id=\""+awayCode+"\">"
			+ "</div>"
			+ "</div>"
			+ "<div class=\"col-xs-3\">"
			+ "<label class=\"control-label\">"+away.Name+"</label>"
			+ "</div>"
		+ "</div>";

	$form.append(content);
}

function addHeadToHeadWin(tableArray, teamName){
	for (let i = 0; i < tableArray.length; i++) {
		const team = tableArray[i];
		if (team.name == teamName) {
			tableArray[i].hd2hd++;
			break;
		}
	}
	return tableArray;
}

function appendHeadToHead(tableArray){
	let pointsDictionary = {};
	//split table into key -> value mapping where key is points
	for (let i = 0; i < tableArray.length; i++) {
		const team = tableArray[i];
		if (!(team.pts in pointsDictionary)) {
			pointsDictionary[team.pts] = [team];
		}
		else{
			pointsDictionary[team.pts].push(team);
		}
	}

	//apply hd2hd points based on head to head matches
	for(var pts in pointsDictionary) {
		if(pointsDictionary[pts].length == 2){
			//find results between the two, determine main winner
			let team1 = pointsDictionary[pts][0].name;
			let team2 = pointsDictionary[pts][1].name;
			results.forEach(result => {
				if ((result.Home.Name == team1 && result.Away.Name == team2)
					|| result.Away.Name == team1 && result.Home.Name == team2){
					
					if (result.Home.Score > result.Away.Score) {
						//home win
						tableArray = addHeadToHeadWin(tableArray, result.Home.Name);
					}
					else if (result.Away.Score > result.Home.Score) {
						//away win
						tableArray = addHeadToHeadWin(tableArray, result.Away.Name);
					}
				}
			});
		}
	}
	return tableArray;
}

function PrintTable(pointsTable){
	$("#table-rows").empty();
	var tableArray = [];
	for (var property in pointsTable) {		
		row = pointsTable[property];
		//{P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0}
		var arrayObj = {
			name: property, 
			p: row.P,
			w: row.W,
			d: row.D,
			l: row.L,
			gf: row.GF,
			ga: row.GA,
			gd: row.GD,
			pts: row.Pts,
			hd2hd: 0
		};
		tableArray[tableArray.length] = arrayObj;
	}

	if(results.length === 24) {
		tableArray = appendHeadToHead(tableArray);
	}

	tableArray.sort(function(a,b){
		return b.pts - a.pts || b.hd2hd - a.hd2hd || b.gd - a.gd || b.gf - a.gf;
	});

	for (var i = 0; i < tableArray.length; i++) {
		var row = tableArray[i];
		var name = "<td>"+row.name+"</td>";
		var p = "<td>"+row.p+"</td>";
		var w = "<td>"+row.w+"</td>";
		var d = "<td>"+row.d+"</td>";
		var l = "<td>"+row.l+"</td>";
		var gf = "<td>"+row.gf+"</td>";
		var ga = "<td>"+row.ga+"</td>";
		var gd = "<td>"+row.gd+"</td>";
		var pts = "<td>"+row.pts+"</td>";
		var htmlRow = "<tr>"+name+p+w+d+l+gf+ga+gd+pts+"</tr>";
		$("#table-rows").append(htmlRow);
	}
}





