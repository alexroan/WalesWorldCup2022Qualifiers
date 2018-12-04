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
	"cro":"Croatia",
	"wal":"Wales",
	"slo":"Slovakia",
	"hun":"Hungary",
	"aze":"Azerbaijan"
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
		"Croatia": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Wales": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Slovakia": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Hungary": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0},
		"Azerbaijan": {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0}
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
	home3 = home.Name.toLowerCase().substring(0,3);
	away3 = away.Name.toLowerCase().substring(0,3);

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
			pts: row.Pts
		};
		tableArray[tableArray.length] = arrayObj;
	}

	tableArray.sort(function(a,b){
		return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf;
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





