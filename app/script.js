const APP_NAME = "hopkins-cpa";

let currentStep = 1;

const formSteps = document.querySelectorAll(".form-step");
const steps = document.querySelectorAll(".step");


// ======================================
// RECORD IDS
// ======================================
let personalRecordId = null;
let householdRecordId = null;


// ======================================
// INIT
// ======================================
ZOHO.CREATOR.init().then(function () {
    console.log("Widget Initialized");
});


// ======================================
// SHOW STEP
// ======================================
function showStep(step){
    formSteps.forEach((form)=>{
        form.classList.remove("active");
    });

    steps.forEach((item)=>{
        item.classList.remove("active");
    });

    formSteps[step - 1].classList.add("active");
    steps[step - 1].classList.add("active");

    currentStep = step;
}


// ======================================
// STEP CLICK
// ======================================
function goToStep(step){
    // STEP 1
    if(step == 1){
        showStep(1);
    }
    // STEP 2
    else if(step == 2){
        if(personalRecordId){
            showStep(2);
        }
        else{
            alert("Please complete Personal Details first");
        }
    }
}


// ======================================
// BACK BUTTON
// ======================================
function prevStep(step){
    showStep(step);

    // BACK TO PERSONAL DETAILS
    if(step == 1){
        getPersonalRecord();
    }
}


// ======================================
// SAVE PERSONAL DETAILS
// ======================================
function savePersonalDetails(){
    const clients = document.getElementById("Clients").value;
    const caseId = document.getElementById("Case").value;
    const aMaster = document.getElementById("A_Master").value;
    const name = document.getElementById("Full_legal_name").value;
    const ssn = document.getElementById("Social_Security_Number_SSN").value;
    const email = document.getElementById("Email_Address").value;
    const phone = document.getElementById("Primary_Phone_Number").value;
    const dob = document.getElementById("Date_of_birth").value;
    const marital = document.getElementById("Marital_Status").value;
    const spouseName = document.getElementById("Spouse_Full_Name").value;
    const spouseSsn = document.getElementById("Spouse_SSN").value;
    
    // Address Inputs
    const addr1 = document.getElementById("address-line-1").value;
    const addr2 = document.getElementById("address-line-2").value;
    const city = document.getElementById("city-district").value;
    const state = document.getElementById("state-dropdown").value;
    const zip = document.getElementById("postal-code").value;
    const country = document.getElementById("country-dropdown").value;

    // VALIDATION
    if(name == "" || ssn == "" || email == ""){
        alert("Please fill mandatory fields");
        return;
    }

    const formData = {
        data: {
            Clients: clients,
            Case: caseId,
            A_Master: aMaster,
            Full_legal_name: name,
            Social_Security_Number_SSN: ssn,
            Email_Address: email,
            Primary_Phone_Number: phone,
            Date_of_birth: dob,
            Marital_Status: marital,
            Spouse_Full_Name: spouseName,
            Spouse_SSN: spouseSsn,
            Address_Line_1: addr1,
            Address_Line_2: addr2,
            City_District: city,
            State_Province: state,
            Postal_Code: zip,
            Country: country
        }
    };

    // CREATE RECORD
    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME,
        formName: "A_Personal_Information", 
        data: formData
    }).then(function(response){
        console.log(response);
        if(response.code == 3000){
            alert("Personal Details Saved");

            // SAVE RECORD ID
            personalRecordId = response.data.ID;
            console.log("Personal Record ID :", personalRecordId);

            // CHANGE BUTTON
            const btn = document.getElementById("basicBtn");
            btn.innerText = "Update & Next";
            btn.onclick = updatePersonalDetails;

            // COMPLETE STEP
            steps[0].classList.add("completed");

            // NEXT STEP
            showStep(2);
        }
    });
}


// ======================================
// GET PERSONAL RECORD
// ======================================
function getPersonalRecord(){
    if(!personalRecordId){
        return;
    }

    ZOHO.CREATOR.API.getRecordById({
        appName: APP_NAME,
        reportName: "All_433_a_personal_Information",
        id: personalRecordId
    }).then(function(response){
        console.log(response);
        if(response.code == 3000){
            // FILL INPUTS
            document.getElementById("Clients").value = response.data.Clients || "";
            document.getElementById("Case").value = response.data.Case || "";
            document.getElementById("A_Master").value = response.data.A_Master || "";
            document.getElementById("Full_legal_name").value = response.data.Full_legal_name || "";
            document.getElementById("Social_Security_Number_SSN").value = response.data.Social_Security_Number_SSN || "";
            document.getElementById("Email_Address").value = response.data.Email_Address || "";
            document.getElementById("Primary_Phone_Number").value = response.data.Primary_Phone_Number || "";
            document.getElementById("Date_of_birth").value = response.data.Date_of_birth || "";
            document.getElementById("Marital_Status").value = response.data.Marital_Status || "Married";
            document.getElementById("Spouse_Full_Name").value = response.data.Spouse_Full_Name || "";
            document.getElementById("Spouse_SSN").value = response.data.Spouse_SSN || "";
            
            // FILL ADDRESS INPUTS
            document.getElementById("address-line-1").value = response.data.Address_Line_1 || "";
            document.getElementById("address-line-2").value = response.data.Address_Line_2 || "";
            document.getElementById("city-district").value = response.data.City_District || "";
            document.getElementById("postal-code").value = response.data.Postal_Code || "";
            
            // BUTTON ACTIONS
            const btn = document.getElementById("basicBtn");
            btn.innerText = "Update & Next";
            btn.onclick = updatePersonalDetails;
        }
    });
}


// ======================================
// UPDATE PERSONAL DETAILS
// ======================================
function updatePersonalDetails(){
    const formData = {
        data: {
            Clients: document.getElementById("Clients").value,
            Case: document.getElementById("Case").value,
            A_Master: document.getElementById("A_Master").value,
            Full_legal_name: document.getElementById("Full_legal_name").value,
            Social_Security_Number_SSN: document.getElementById("Social_Security_Number_SSN").value,
            Email_Address: document.getElementById("Email_Address").value,
            Primary_Phone_Number: document.getElementById("Primary_Phone_Number").value,
            Date_of_birth: document.getElementById("Date_of_birth").value,
            Marital_Status: document.getElementById("Marital_Status").value,
            Spouse_Full_Name: document.getElementById("Spouse_Full_Name").value,
            Spouse_SSN: document.getElementById("Spouse_SSN").value,
            Address_Line_1: document.getElementById("address-line-1").value,
            Address_Line_2: document.getElementById("address-line-2").value,
            City_District: document.getElementById("city-district").value,
            State_Province: document.getElementById("state-dropdown").value,
            Postal_Code: document.getElementById("postal-code").value,
            Country: document.getElementById("country-dropdown").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME,
        reportName: "All_433_a_personal_Information",
        id: personalRecordId,
        data: formData
    }).then(function(response){
        if(response.code == 3000){
            alert("Personal Details Updated");
            showStep(2);
        }
    });
}


// ======================================
// SAVE HOUSEHOLD DETAILS
// ======================================
function saveHouseholdDetails(){
    // Ensure the subform grid variables serialize right before compile
    serializeSubform();

    const householdPeople = document.getElementById("Number_of_people_in_household").value;
    const claimDependents = document.getElementById("Do_you_claim_dependents").value;
    const serializedData = document.getElementById("serializedSubformData").value;

    if(householdPeople == ""){
        alert("Please specify the number of people in the household");
        return;
    }

    const formData = {
        data: {
            Clients: formSteps[1].querySelector("#Clients").value,
            Case: formSteps[1].querySelector("#Case").value,
            A_Master: formSteps[1].querySelector("#A_Master").value,
            Number_of_people_in_household: householdPeople,
            Do_you_claim_dependents: claimDependents,
            // Hidden single line text field link-name in your Creator backend form
            Dependents: serializedData 
        }
    };

    // CREATE RECORD
    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME,
        formName: "A_Household_Dependents",
        data: formData
    }).then(function(response){
        if(response.code == 3000){
            alert("Household Details Saved");

            householdRecordId = response.data.ID;

            const btn = document.getElementById("educationBtn");
            btn.innerText = "Update";
            btn.onclick = updateHouseholdDetails;

            steps[1].classList.add("completed");
        }
    });
}


// ======================================
// UPDATE HOUSEHOLD DETAILS
// ======================================
function updateHouseholdDetails(){
    serializeSubform();

    const formData = {
        data: {
            Clients: formSteps[1].querySelector("#Clients").value,
            Case: formSteps[1].querySelector("#Case").value,
            A_Master: formSteps[1].querySelector("#A_Master").value,
            Number_of_people_in_household: document.getElementById("Number_of_people_in_household").value,
            Do_you_claim_dependents: document.getElementById("Do_you_claim_dependents").value,
            Dependents: document.getElementById("serializedSubformData").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME,
        reportName: "A_Household_Dependents_Report",
        id: householdRecordId,
        data: formData
    }).then(function(response){
        if(response.code == 3000){
            alert("Household Details Updated");
        }
    });
}