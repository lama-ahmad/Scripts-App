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
		listholder.innerHTML += "<li><a href=\"#sign\" onclick=updateCurrentPetition(" + row.id + ")>" + row.title + "<br></a>" + row.description + " (<a href='javascript:void(0);' onclick='deletePetition(" + row.id + ");'>Hide Petition</a>)" + "</li>"; //+ "<ons-button>"Click me"</ons-button>"

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

//function to update the sign page with a summary from the selected petition
function updateSignPage(transaction, results){
	var summaryholder = document.getElementById("petition-summary");
	var numberholder = document.getElementById("call-num");

	summaryholder.innerHTML = "";
	numberholder.innerHTML = "";

	var i;
	for(i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);

	} 

	summaryholder.innerHTML += "<p>" + row.summary + "</p>";
	numberholder.innerHTML += "<p>" + row.telnum + "</p>";

}


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

	//Test to ensure that the user has entered both title and description
	if (title !=="" && description !== "") {
		//Insert user entered details into petitons table, use of ? placeholder will be replaced by data passed in as an array as the second parameter
		mydb.transaction(function (t){
			t.executeSql("INSERT INTO petitions (title, description, summary, telnum) VALUES (?, ?, ?, ?)", [title, description, summary, telnum]);
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


// function updateSignees(transaction, results){
// 	var this_name = document.getElementById("signee_name");

// 	this_name.innerHTML = "";

// 	var i;
// 	for(i = 0; i < results.rows.length; i++) {
// 		var row = results.rows.item(i);

// 	} 

// 	this_name.innerHTML += row.name;

// }


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

// // Function to count the signees for a particular petition
// function countSignees(){
// 	if (mydb){
// 		mydb.transaction(function (t){
// 			t.executeSql("SELECT * FROM signees WHERE petitionid=?", [myRow], updateSigneeCount);
// 		})
// 	}
// }


// Function to output the number of signees
function updateSigneeCount(transaction, results){

	var signatures = document.getElementById("signatures");

	signatures.innerHTML =  ""

	// var i;
	// for(i = 0; i < results.rows.length; i++) {
	// 	var row = results.rows.item(i);
	// }

	signatures.innerHTML += "Signatures: " + results.rows.length;


}

$(document).on("pageshow","#sign",function(){
	if (mydb) {
		mydb.transaction(function (t){
			t.executeSql("SELECT * FROM signees WHERE petitionid=?", [myRow], updateSigneeCount);
			console.log(myRow);
		});
	}
	else {
		alert("Not Found");
	}
});

outputPetitions();







