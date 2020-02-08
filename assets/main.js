
//selecting buttons and inputs in the header
const addPartyBtn = document.querySelector(".addPartyBtn");
const submissionBtn = document.querySelector(".submissionBtn");
const numberOfSeats = document.querySelector(".numberOfSeats");
const thresholdInput = document.querySelector(".threshold")

//adding eventListeners to buttons/inputs
addPartyBtn.addEventListener("click", partyCreator);
submissionBtn.addEventListener("click", initiateCalculation);
numberOfSeats.addEventListener("change", numberOfSeatsChanger)
thresholdInput.addEventListener("change", thresholdSetter)

//selecting division where new parties are added
const partySelection = document.querySelector(".partySelection")

//creating an array that will hold info of all of the parties
let parties = [];

// a variable that will be used to give parties their unique identifiers
let idCounter = 0;

// a variable storing the total number of mps
let mpsTotal = 20;
//a variable storing the number of seats left
let seatsLeft = 20;

// a variable storing the threshold needed to gain representation
let threshold = 0;

// a table used for showing final results
resultsTable = document.querySelector(".resultsTable");


//creating a function that hadles party creation
function partyCreator() {
  // creating a div holding all of a party's elements
  let newParty = document.createElement("div");
  newParty.className = "singleParty";
  let partyID = idCounter;
  newParty.setAttribute("id", idCounter);
  partySelection.appendChild(newParty);
  idCounter++;

  // creating input elements to provide party's name
  let partyName = document.createElement("input");
  partyName.className = "input partyName";
  partyName.setAttribute("Placeholder", "Party Name");
  partyName.addEventListener("change", nameChanger)
  newParty.appendChild(partyName);

  // and its amount of votes
  let votesNumber = document.createElement("input");
  votesNumber.className = "input votesNumber";
  votesNumber.setAttribute("Placeholder", "Number of Votes");
  votesNumber.setAttribute("type", "number")
  votesNumber.addEventListener("change", voteChanger)
  newParty.appendChild(votesNumber);

  // creating a button that removes a party
  let removePartyBtn = document.createElement("button");
  removePartyBtn.className = "btn removePartyBtn";
  removePartyBtn.textContent = "Remove Party"
  newParty.appendChild(removePartyBtn);
  removePartyBtn.addEventListener("click", partyRemoval);
}


// creating a function that removes a redundant party from the list as well as from the "parties" array
function partyRemoval(e) {
  let partyForRemoval = e.target.parentElement;
  partySelection.removeChild(partyForRemoval);
  parties.forEach((party, index) => {
    if (party.id == partyForRemoval.id) {
      parties.splice(index, 1);
    }
  });}


// function handling adding a name / changing the name
function nameChanger(e) {
  let idToBeChecked = e.target.parentElement.id;
  // if a party in this row exists, the name is adjusted
  if (parties.filter(party => party.id == idToBeChecked).length > 0) {
    parties.forEach(party => {
      if (party.id == idToBeChecked) {
        party.name = e.target.value;
      }});
  // if a party doesn't exist just yet, a new object literal is created and added to the parties array. Votes calculated will be used later on during seat allocation.
  } else {
    let newlyCreatedParty = {"id" : idToBeChecked, 'name' : e.target.value, "votes" : 0, "votesCalculated" : Number(e.target.value), "mpsGranted" : 0};
    parties.push(newlyCreatedParty);
  }
}

// function handling adding the number of votes / changing the number of votes
function voteChanger(e) {
  let idToBeChecked = e.target.parentElement.id;
  // if a party in this row exists, its votes' count is adjusted
  if (parties.filter(party => party.id == idToBeChecked).length > 0) {
    parties.forEach(party => {
      if (party.id == idToBeChecked) {
        party.votes = Number(e.target.value);
        party.votesCalculated = Number(e.target.value);
      }});
  // if a party doesn't exist just yet, a new object literal is created and added to the parties array. Votes calculated will be used later on during seat allocation.
  } else {
    let newlyCreatedParty = {"id" : idToBeChecked, 'name' : '', "votes" : Number(e.target.value), "votesCalculated" : Number(e.target.value), "mpsGranted" : 0};
    parties.push(newlyCreatedParty);
  }
}

function numberOfSeatsChanger(e) {
  mpsTotal = Number(e.target.value);
  seatsLeft = Number(e.target.value);
}

function thresholdSetter(e) {
  threshold = Number(e.target.value)*0.01;
}

// function handling seats counting
function initiateCalculation() {
  // if statement that checks if this is the first time the user clicks submit. If not, it cleans the data so that the calculation is repeated from scratch.
  if (resultsTable.rows.length > 1) {
    resetResults()
  }

  // if statement that checks if there are any seats left to allocate. If so, it calls a function that allocates a seat and decrements the amount of seats available.
  if (seatsLeft > 0) {
    allocateSeat();
    seatsLeft--;
    initiateCalculation();
  } else {
    showResults();
  }
}

// this function finds the party that is next in line to receive a seat by sorting by votesCalculated. it grants them that seat and recalculates the votesCalculated variable.
function allocateSeat() {
  let votesTotal = parties.reduce((total, party) => total + party.votes, 0);
  parties = parties.sort((a, b) => b.votesCalculated - a.votesCalculated);
  if (parties[0].votes / votesTotal < threshold) {
    parties[0].votesCalculated = 0;
    allocateSeat();
  }
  parties[0].mpsGranted++;
  parties[0].votesCalculated = parties[0].votes / (parties[0].mpsGranted+1);
}


function showResults() {
  let votesTotal = parties.reduce((total, party) => total + party.votes, 0);
  parties = parties.sort((a, b) => b.mpsGranted - a.mpsGranted);

  parties.forEach(party => {
    let newRow = document.createElement("tr");
    resultsTable.appendChild(newRow);

    let nameCell = document.createElement("td");
    nameCell.textContent = party.name;
    newRow.appendChild(nameCell);

    let votesCell = document.createElement("td");
    votesCell.textContent = party.votes;
    newRow.appendChild(votesCell);

    let votesPercentageCell = document.createElement("td");
    votesPercentageCell.textContent = (party.votes / votesTotal * 100).toFixed(2);
    votesPercentageCell.textContent += "%";
    newRow.appendChild(votesPercentageCell);

    let seatsCell = document.createElement("td");
    seatsCell.textContent = party.mpsGranted;
    newRow.appendChild(seatsCell);

    let seatsPercentage = document.createElement("td");
    seatsPercentage.textContent = (party.mpsGranted / mpsTotal * 100).toFixed(2);
    seatsPercentage.textContent += "%";
    newRow.appendChild(seatsPercentage);
    })
  };


// in order to calculate the data again, some items need to be returned to their original state.
function resetResults() {
  seatsLeft = mpsTotal;
  parties.forEach(party => {
    party.votesCalculated = party.votes;
    party.mpsGranted = 0;
    if (resultsTable.rows.length > 1) {
      resultsTable.deleteRow(1);
    }
  });
}
