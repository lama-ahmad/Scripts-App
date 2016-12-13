var myRow;
var counter;

if (window.openDatabase) {
	//Create database with parameters (database name, version, description, size in bytes)
	var mydb = openDatabase("petitions_db", "0.1", "A Database of the Petitions Created", 1024 * 1024);

	//create petitions table using SQL for the databse using a transaction 
	mydb.transaction(function (t) {
		t.executeSql("CREATE TABLE IF NOT EXISTS petitions (id INTEGER PRIMARY KEY ASC, title TEXT, description TEXT)");
	});

	mydb.transaction(function (t) {
		t.executeSql("CREATE TABLE IF NOT EXISTS signees (id INTEGER PRIMARY KEY ASC, name TEXT, email TEXT, petitionid INTEGER)");	
	});	

	// mydb.transaction(function (t){
	// 	t.executeSql("ALTER TABLE petitions ADD summary TEXT");
	// });

	// mydb.transaction(function (t){
	// 	t.executeSql("ALTER TABLE petitions ADD telnum TEXT");
	// });



}
 else {
	alert("WebSQL is not supported!");
}

// What is my Current Petiton
function updateCurrentPetition(id){
	myRow = id;
}

// 

//function to output list of petitions in the database
function updatePetitionList(transaction, results){
	//initialise listitems 
	var listitems = ""
	//get the petition list holder ul
	var listholder = document.getElementById("petitionlist");

	//clear petition list ul
	listholder.innerHTML = "";

	var i;
	//Iterate through the results
	for(i = 0; i < results.rows.length; i++) {
		//Get the current row 
		var row = results.rows.item(i);
		// get the number of signees associated with current petition id  var signees = getSignees(row.id)
		listholder.innerHTML += "<li><a href=\"#sign\" onclick=updateCurrentPetition(" + row.id + ")>" + row.title + "<br>" + row.description + "</a></li>"; //+ "<ons-button>"Click me"</ons-button>"
		$("#petitionlist").listview("refresh");

	}
}

//function to get the list of petitions from the database 
function outputPetitions() {
	//check to ensure mydb object has been created
	if (mydb) {
		//Get all the petitons from the database with a select statement, set outputPetitions as the callback function for the executeSql command
		mydb.transaction(function (t){
			t.executeSql("SELECT * FROM petitions", [], updatePetitionList);
		});
	}
	else {
		alert("Database not found");
	}
}

//function to update the sign page with a summary, call number, and script from the selected petition
function updateSignPage(transaction, results){
	var summaryholder = document.getElementById("petition-summary");
	var numberholder = document.getElementById("call-num");
	var scriptholder = document.getElementById("call-script");

	summaryholder.innerHTML = "";
	numberholder.innerHTML = "";
	scriptholder.innerHTML = "";

	var i;
	for(i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);

	} 

	summaryholder.innerHTML += "<p>" + row.summary + "</p>";
	numberholder.innerHTML += "<p>If you care about this issue, call this number: " + row.telnum + "</p>";
	scriptholder.innerHTML += row.script

}

// FUnction that updates Summary, Call Number, and Script on Load of Sign Page 
$(document).on("pageshow","#sign",function(){
	if (mydb) {
		mydb.transaction(function (t){
			t.executeSql("SELECT * FROM petitions WHERE id=?", [myRow], updateSignPage);
		});
	}
	else {
		alert("Not Found");
	}
});


//function to add petition to the database
function addPetition(){
	//check to ensure mydb object has been created
	if (mydb) {
	//Get values of the title and description inputs
	var title = document.getElementById("title").value;
	var description = document.getElementById("description").value;
	var summary = document.getElementById("summary").value;
	var telnum = document.getElementById("telnum").value;
	var script = document.getElementById("script").value;

	//Test to ensure that the user has entered both title and description
	if (title !=="" && description !== "") {
		//Insert user entered details into petitons table, use of ? placeholder will be replaced by data passed in as an array as the second parameter
		mydb.transaction(function (t){
			t.executeSql("INSERT INTO petitions (title, description, summary, telnum, script) VALUES (?, ?, ?, ?, ?)", [title, description, summary, telnum, script]);
			outputPetitions();
		});
	} 
	else {
		alert("Fill in required fields");
	}
	}
}

function deletePetition(id) {
	 //check to ensure the mydb object has been created
    if (mydb) {
        //Get all the petitions from the database with a select statement, set outputPetitons as the callback function for the executeSql command
        mydb.transaction(function (t) {
            t.executeSql("DELETE FROM petitions WHERE id=?", [id], outputPetitions);
        });
    } else {
        alert("db not found, your browser does not support web sql!");
   }
}



// Add a Signee To Database 
function addSignee(){
	if (mydb) {
		var name = document.getElementById("name-signee").value;
		var email = document.getElementById("email-signee").value;

		if (name !=="" && email !=="") {
			mydb.transaction(function (t) {
				t.executeSql("INSERT INTO signees (name, email, petitionid) VALUES (?, ?, ?)", [name, email, myRow]);

			});
		}
		else{
			alert("Fill in required fields");
		}
	}
}


function outputSignees() {
		//check to ensure mydb object has been created
	if (mydb) {
		//Get all the petitons from the database with a select statement, set outputPetitions as the callback function for the executeSql command
		mydb.transaction(function (t){
			t.executeSql("SELECT * FROM signees", [], updateSignees);
		});
	}
	else {
		alert("Database not found");
	}
}



// Function to output the number of signees on sign page
function updateSigneeCount(transaction, results){

	var signatures = document.getElementById("signatures");

	signatures.innerHTML =  ""

	signatures.innerHTML += "Signatures: " + results.rows.length;


}

// Function that updates Signee Count on Sign Page Load
$(document).on("pageshow","#sign",function(){
	if (mydb) {
		mydb.transaction(function (t){
			t.executeSql("SELECT * FROM signees WHERE petitionid=?", [myRow], updateSigneeCount);
		});
	}
	else {
		alert("Not Found");
	}
});


//Function that updates  Action Page
function updateAction(transaction, results){
	var numberholder = document.getElementById("call-num");
	var scriptholder = document.getElementById("call-script");

	numberholder.innerHTML = "";
	scriptholder.innerHTML = "";

	var i;
	for(i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
	} 

	numberholder.innerHTML += "<p>If you care about this issue, call this number: " + row.telnum + "</p>";
	scriptholder.innerHTML += row.script
}

// Function for Action Page on Load
$(document).on("pageshow","#action",function(){
	if (mydb) {
		mydb.transaction(function (t){
			t.executeSql("SELECT * FROM petitions WHERE id=?", [myRow], updateAction);
		});
	}
	else {
		alert("Not Found");
	}
});


// // Function to output the number of signees on home page 
// function updateNumSigs(transaction, results){

// 	var signatures = document.getElementById("signum");

// 	signatures.innerHTML =  ""

// 	// var i;
// 	// //Iterate through the results
// 	// for(i = 0; i < results.rows.length; i++) {
// 	// 	//Get the current row 
// 	// 	var row = results.rows.item(i);
// 		signatures.innerHTML += "Signatures: " + results.rows.length;
// 	// }
// }


// Function that updates Signee Count on Sign Page Load
// $(document).on("pageshow","#home",function(){
// 	if (mydb) {
// 		mydb.transaction(function (t){
// 			t.executeSql("SELECT * FROM signees WHERE petitionid=?", [myRow], updateNumSigs);
// 		});
// 	}
// 	else {
// 		alert("Not Found");
// 	}
// });



// // Function that counts signees
// function countSignees(id){
// 	if (mydb) {
// 		mydb.transaction(function (t){
// 			t.executeSql("SELECT * FROM signees WHERE petitionid=?", [id]);
// 		});
// 	}
// 	else {
// 		alert("Not Found");
// 	}
// };


outputPetitions();







