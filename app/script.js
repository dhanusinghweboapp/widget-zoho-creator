const APP_NAME = "hopkins-cpa";

let currentStep = 1;

const formSteps = document.querySelectorAll(".form-step");
const steps = document.querySelectorAll(".step");

// ======================================
// RECORD IDS (State Management)
// ======================================
let personalRecordId = null;
let householdRecordId = null;
let employmentRecordId = null;
let incomeRecordId = null;
let expensesRecordId = null;
let bankRecordId = null;
let vehicleRecordId = null;
let documentsRecordId = null;

// ======================================
// INIT
// ======================================
ZOHO.CREATOR.init().then(function () {
    console.log("Widget Initialized");
});

// ======================================
// SHOW STEP
// ======================================
function showStep(step) {
    formSteps.forEach((form) => {
        form.classList.remove("active");
    });

    steps.forEach((item) => {
        item.classList.remove("active");
    });

    formSteps[step - 1].classList.add("active");
    steps[step - 1].classList.add("active");

    currentStep = step;
}

// ======================================
// STEP CLICK NAVIGATION
// ======================================
function goToStep(step) {
    if (step == 1) { showStep(1); }
    else if (step == 2) { personalRecordId ? showStep(2) : alert("Please complete Personal Details first"); }
    else if (step == 3) { householdRecordId ? showStep(3) : alert("Please complete Household Details first"); }
    else if (step == 4) { employmentRecordId ? showStep(4) : alert("Please complete Employment Details first"); }
    else if (step == 5) { incomeRecordId ? showStep(5) : alert("Please complete Income Details first"); }
    else if (step == 6) { expensesRecordId ? showStep(6) : alert("Please complete Expenses Details first"); }
    else if (step == 7) { bankRecordId ? showStep(7) : alert("Please complete Bank Details first"); }
    else if (step == 8) { vehicleRecordId ? showStep(8) : alert("Please complete Assets Details first"); }
}

// ======================================
// BACK BUTTON (Dynamically goes to prev step)
// ======================================
function prevStep(step) {
    let targetStep = currentStep - 1;
    if (targetStep < 1) targetStep = 1;
    showStep(targetStep);
}

// ======================================
// STEP 1: PERSONAL DETAILS
// ======================================
function savePersonalDetails() {
    const stepIndex = 0;
    const clients = formSteps[stepIndex].querySelector("#Clients").value;
    const caseId = formSteps[stepIndex].querySelector("#Case").value;
    const aMaster = formSteps[stepIndex].querySelector("#A_Master").value;
    const name = formSteps[stepIndex].querySelector("#Full_legal_name").value;
    const ssn = formSteps[stepIndex].querySelector("#Social_Security_Number_SSN").value;
    const email = formSteps[stepIndex].querySelector("#Email_Address").value;
    const phone = formSteps[stepIndex].querySelector("#Primary_Phone_Number").value;
    const dob = formSteps[stepIndex].querySelector("#Date_of_birth").value;
    const marital = formSteps[stepIndex].querySelector("#Marital_Status").value;
    const spouseName = formSteps[stepIndex].querySelector("#Spouse_Full_Name").value;
    const spouseSsn = formSteps[stepIndex].querySelector("#Spouse_SSN").value;
    
    const addr1 = formSteps[stepIndex].querySelector("#address-line-1").value;
    const addr2 = formSteps[stepIndex].querySelector("#address-line-2").value;
    const city = formSteps[stepIndex].querySelector("#city-district").value;
    const state = formSteps[stepIndex].querySelector("#state-dropdown").value;
    const zip = formSteps[stepIndex].querySelector("#postal-code").value;
    const country = formSteps[stepIndex].querySelector("#country-dropdown").value;

    if (name == "" || ssn == "" || email == "") {
        alert("Please fill mandatory fields");
        return;
    }

    const formData = {
        data: {
            Clients: clients, Case: caseId, A_Master: aMaster, Full_legal_name: name,
            Social_Security_Number_SSN: ssn, Email_Address: email, Primary_Phone_Number: phone,
            Date_of_birth: dob, Marital_Status: marital, Spouse_Full_Name: spouseName, Spouse_SSN: spouseSsn,
            Address_Line_1: addr1, Address_Line_2: addr2, City_District: city, State_Province: state,
            Postal_Code: zip, Country: country
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Personal_Information", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Personal Details Saved");
            personalRecordId = response.data.ID;
            
            const btn = formSteps[stepIndex].querySelector("#basicBtn");
            btn.innerText = "Update & Next";
            btn.onclick = updatePersonalDetails;
            
            steps[0].classList.add("completed");
            showStep(2);
        }
    });
}

function updatePersonalDetails() {
    const stepIndex = 0;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Full_legal_name: formSteps[stepIndex].querySelector("#Full_legal_name").value,
            Social_Security_Number_SSN: formSteps[stepIndex].querySelector("#Social_Security_Number_SSN").value,
            Email_Address: formSteps[stepIndex].querySelector("#Email_Address").value,
            Primary_Phone_Number: formSteps[stepIndex].querySelector("#Primary_Phone_Number").value,
            Date_of_birth: formSteps[stepIndex].querySelector("#Date_of_birth").value,
            Marital_Status: formSteps[stepIndex].querySelector("#Marital_Status").value,
            Spouse_Full_Name: formSteps[stepIndex].querySelector("#Spouse_Full_Name").value,
            Spouse_SSN: formSteps[stepIndex].querySelector("#Spouse_SSN").value,
            Address_Line_1: formSteps[stepIndex].querySelector("#address-line-1").value,
            Address_Line_2: formSteps[stepIndex].querySelector("#address-line-2").value,
            City_District: formSteps[stepIndex].querySelector("#city-district").value,
            State_Province: formSteps[stepIndex].querySelector("#state-dropdown").value,
            Postal_Code: formSteps[stepIndex].querySelector("#postal-code").value,
            Country: formSteps[stepIndex].querySelector("#country-dropdown").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "All_433_a_personal_Information", id: personalRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Personal Details Updated");
            showStep(2);
        }
    });
}


// ======================================
// STEP 2: HOUSEHOLD DETAILS
// ======================================
function serializeDependentsSubform() {
    const rows = document.querySelectorAll("#customSubformTable .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const nameInput = row.querySelector(".dep-name");
        const relInput = row.querySelector(".dep-relationship");
        const dobInput = row.querySelector(".dep-dob");
        const ssnInput = row.querySelector(".dep-ssn");
        const studentInput = row.querySelector(".dep-student");

        if (!nameInput) return;

        const fullName = nameInput.value.trim();
        const relationship = relInput ? relInput.value : "";
        const dob = dobInput ? dobInput.value : "";
        const ssn = ssnInput ? ssnInput.value.trim() : "";
        const isStudentChecked = studentInput ? studentInput.checked : false;

        if (fullName) {
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            const dependentNameObj = {
                first_name: firstName,
                last_name: lastName,
                status: "edit"
            };

            dataArray.push({
                "Dependent_Name": JSON.stringify(dependentNameObj),
                "Dependent_Relationship_to_you": relationship,
                "Date_of_Birth": dob,
                "SSN": ssn,
                "Is_dependent_full_time_Student": isStudentChecked ? "zc_checked" : "zc_unchecked",
                "record::status": "added",
                "row::key": `t::row_${index + 1}`
            });
        }
    });
    return JSON.stringify(dataArray);
}

function saveHouseholdDetails() {
    const stepIndex = 1;
    const serializedData = serializeDependentsSubform();
    const householdPeople = formSteps[stepIndex].querySelector("#Number_of_people_in_household").value;
    const claimDependents = formSteps[stepIndex].querySelector("#Do_you_claim_dependents").value;

    if (householdPeople === "") {
        alert("Please specify the number of people in the household");
        return;
    }

    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Number_of_people_in_household: householdPeople,
            Do_you_claim_dependents: claimDependents,
            Dependents: serializedData
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Household_Dependents", data: formData
    }).then(function(response) {
        if (response.code === 3000) {
            alert("Household Details Saved");
            householdRecordId = response.data.ID;
            const btn = formSteps[stepIndex].querySelector("#educationBtn");
            if (btn) {
                btn.innerText = "Update & Next";
                btn.onclick = updateHouseholdDetails;
            }
            steps[stepIndex].classList.add("completed");
            showStep(3);
        }
    });
}

function updateHouseholdDetails() {
    const stepIndex = 1;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Number_of_people_in_household: formSteps[stepIndex].querySelector("#Number_of_people_in_household").value,
            Do_you_claim_dependents: formSteps[stepIndex].querySelector("#Do_you_claim_dependents").value,
            Dependents: serializeDependentsSubform()
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "A_Household_Dependents_Report", id: householdRecordId, data: formData
    }).then(function(response) {
        if (response.code === 3000) {
            alert("Household Details Updated");
            showStep(3);
        }
    });
}


// ======================================
// STEP 3: EMPLOYMENT DETAILS
// ======================================
function saveEmploymentDetails() {
    const stepIndex = 2;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Employment_Status: formSteps[stepIndex].querySelector("#Employment_Status").value,
            Employer_Name: formSteps[stepIndex].querySelector("#Employer_Name").value,
            Job_Title: formSteps[stepIndex].querySelector("#Job_Title").value,
            Pay_Frequency: formSteps[stepIndex].querySelector("#Pay_Frequency").value,
            Gross_Pay_Per_Paycheck: formSteps[stepIndex].querySelector("#Gross_Pay_Per_Paycheck").value,
            Net_Pay_Per_Paycheck: formSteps[stepIndex].querySelector("#Net_Pay_Per_Paycheck").value
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Employment", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Employment Details Saved");
            employmentRecordId = response.data.ID;
            
            const btn = formSteps[stepIndex].querySelectorAll("button")[1];
            btn.innerText = "Update & Next";
            btn.onclick = updateEmploymentDetails;
            
            steps[stepIndex].classList.add("completed");
            showStep(4);
        }
    });
}

function updateEmploymentDetails() {
    const stepIndex = 2;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Employment_Status: formSteps[stepIndex].querySelector("#Employment_Status").value,
            Employer_Name: formSteps[stepIndex].querySelector("#Employer_Name").value,
            Job_Title: formSteps[stepIndex].querySelector("#Job_Title").value,
            Pay_Frequency: formSteps[stepIndex].querySelector("#Pay_Frequency").value,
            Gross_Pay_Per_Paycheck: formSteps[stepIndex].querySelector("#Gross_Pay_Per_Paycheck").value,
            Net_Pay_Per_Paycheck: formSteps[stepIndex].querySelector("#Net_Pay_Per_Paycheck").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "A_Employment_Report", id: employmentRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Employment Details Updated");
            showStep(4);
        }
    });
}


// ======================================
// STEP 4: INCOME DETAILS
// ======================================
function saveIncomeDetails() {
    const stepIndex = 3;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Monthly_Wage_Income: formSteps[stepIndex].querySelector("#Monthly_Wage_Income").value,
            Self_Employment_Income: formSteps[stepIndex].querySelector("#Self_Employment_Income").value,
            Other_Income_Sources: formSteps[stepIndex].querySelector("#Other_Income_Sources").value
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Income", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Income Details Saved");
            incomeRecordId = response.data.ID;
            
            const btn = formSteps[stepIndex].querySelectorAll("button")[1]; 
            btn.innerText = "Update & Next";
            btn.onclick = updateIncomeDetails;
            
            steps[stepIndex].classList.add("completed");
            showStep(5);
        }
    });
}

function updateIncomeDetails() {
    const stepIndex = 3;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Monthly_Wage_Income: formSteps[stepIndex].querySelector("#Monthly_Wage_Income").value,
            Self_Employment_Income: formSteps[stepIndex].querySelector("#Self_Employment_Income").value,
            Other_Income_Sources: formSteps[stepIndex].querySelector("#Other_Income_Sources").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "A_Income_Report", id: incomeRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Income Details Updated");
            showStep(5);
        }
    });
}


// ======================================
// STEP 5: EXPENSES DETAILS
// ======================================
function saveExpensesDetails() {
    const stepIndex = 4;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Monthly_Rent_or_Mortgage: formSteps[stepIndex].querySelector("#Monthly_Rent_or_Mortgage").value,
            Utilities: formSteps[stepIndex].querySelector("#Utilities_total").value,
            Food_and_Household_Expenses: formSteps[stepIndex].querySelector("#Food_and_Household_Expenses").value,
            Medical_Expenses: formSteps[stepIndex].querySelector("#Medical_Expenses").value,
            Transportation_Expenses: formSteps[stepIndex].querySelector("#Transportation_Expenses").value
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Expenses", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Expense Details Saved");
            expensesRecordId = response.data.ID;
            
            const btn = formSteps[stepIndex].querySelectorAll("button")[1]; 
            btn.innerText = "Update & Next";
            btn.onclick = updateExpensesDetails;
            
            steps[stepIndex].classList.add("completed");
            showStep(6);
        }
    });
}

function updateExpensesDetails() {
    const stepIndex = 4;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Monthly_Rent_or_Mortgage: formSteps[stepIndex].querySelector("#Monthly_Rent_or_Mortgage").value,
            Utilities: formSteps[stepIndex].querySelector("#Utilities_total").value,
            Food_and_Household_Expenses: formSteps[stepIndex].querySelector("#Food_and_Household_Expenses").value,
            Medical_Expenses: formSteps[stepIndex].querySelector("#Medical_Expenses").value,
            Transportation_Expenses: formSteps[stepIndex].querySelector("#Transportation_Expenses").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "A_Expenses_Report", id: expensesRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Expense Details Updated");
            showStep(6);
        }
    });
}


// ======================================
// STEP 6: BANK DETAILS
// ======================================
function serializeBankSubform() {
    const rows = document.querySelectorAll("#customSubformTableBANK .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const bankNameEl = row.querySelector(".bank-name");
        if (!bankNameEl) return; 

        const bankTypeEl = row.querySelector(".bank-type");
        const balanceEl = row.querySelector(".bank-balance");

        const bankName = bankNameEl.value.trim();
        const bankType = bankTypeEl ? bankTypeEl.value : "";
        const balance = balanceEl ? balanceEl.value.trim() : "";

        if (bankName) {
            dataArray.push({
                "Bank_Name": bankName,
                "Bank_Type": bankType,
                "Balance": balance,
                "record::status": "added",
                "row::key": `t::row_${index + 1}`
            });
        }
    });
    return JSON.stringify(dataArray);
}

function saveBankDetails() {
    const stepIndex = 5;
    const serializedData = serializeBankSubform();

    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_have_bank_accounts: formSteps[stepIndex].querySelector("#Do_you_have_bank_accounts").value,
            Bank_Account_Details: serializedData
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Bank_Accounts", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Bank Details Saved");
            bankRecordId = response.data.ID;
            
            const btn = formSteps[stepIndex].querySelectorAll("button")[1]; 
            btn.innerText = "Update & Next";
            btn.onclick = updateBankDetails;
            
            steps[stepIndex].classList.add("completed");
            showStep(7);
        }
    });
}

function updateBankDetails() {
    const stepIndex = 5;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_have_bank_accounts: formSteps[stepIndex].querySelector("#Do_you_have_bank_accounts").value,
            Bank_Account_Details: serializeBankSubform()
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "All_433_a_bank_Accounts", id: bankRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Bank Details Updated");
            showStep(7);
        }
    });
}


// ======================================
// STEP 7: ASSETS / VEHICLE DETAILS
// ======================================
function serializeVehicleSubform() {
    const rows = document.querySelectorAll("#customSubformTablevehicle .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const makeEl = row.querySelector(".vehicle-make");
        if (!makeEl) return;

        const modelEl = row.querySelector(".vehicle-model");
        const valueEl = row.querySelector(".vehicle-value");

        const make = makeEl.value.trim();
        const model = modelEl ? modelEl.value.trim() : "";
        const value = valueEl ? valueEl.value.trim() : "";

        if (make) {
            dataArray.push({
                "Vehicle_Make": make,
                "Vehicle_Model": model,
                "Vehicle_Value": value,
                "record::status": "added",
                "row::key": `t::row_${index + 1}`
            });
        }
    });
    return JSON.stringify(dataArray);
}

function saveVehicleDetails() {
    const stepIndex = 6;
    const serializedData = serializeVehicleSubform();

    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_own_a_vehicle: formSteps[stepIndex].querySelector("#Do_you_own_a_vehicle").value,
            Vehicle_details: serializedData
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Assets", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Vehicle Details Saved");
            vehicleRecordId = response.data.ID;
            
            const btn = formSteps[stepIndex].querySelectorAll("button")[1]; 
            btn.innerText = "Update & Next";
            btn.onclick = updateVehicleDetails;
            
            steps[stepIndex].classList.add("completed");
            showStep(8);
        }
    });
}

function updateVehicleDetails() {
    const stepIndex = 6;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_own_a_vehicle: formSteps[stepIndex].querySelector("#Do_you_own_a_vehicle").value,
            Vehicle_details: serializeVehicleSubform()
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "All_Assets", id: vehicleRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Vehicle Details Updated");
            showStep(8);
        }
    });
}


// ======================================
// STEP 8: DOCUMENTS DETAILS
// ======================================
function saveDocumentsDetails() {
    const stepIndex = 7;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Personal_Master: formSteps[stepIndex].querySelector("#Personal_Master").value,
            Entity_Master: formSteps[stepIndex].querySelector("#Entity_Master").value
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "Document_Upload_Wizard", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Documents Saved Successfully!");
            documentsRecordId = response.data.ID;
            
            const btn = formSteps[stepIndex].querySelectorAll("button")[1]; 
            btn.innerText = "Update Final";
            btn.onclick = updateDocumentsDetails;
            
            steps[stepIndex].classList.add("completed");
        }
    });
}

function updateDocumentsDetails() {
    const stepIndex = 7;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Personal_Master: formSteps[stepIndex].querySelector("#Personal_Master").value,
            Entity_Master: formSteps[stepIndex].querySelector("#Entity_Master").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "All_Document_Upload_Wizards", id: documentsRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            alert("Documents Updated Successfully!");
        }
    });
}