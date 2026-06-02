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

// Track your files in memory before uploading
let fileArrayOne = [];
let fileArrayTwo = [];

// ======================================
// INIT
// ======================================
ZOHO.CREATOR.init().then(function () {
    console.log("Widget Initialized");
});

document.addEventListener("DOMContentLoaded", function() {
    fetchCountries();
    // Initialize one row for each subform
    addDependentRow();
    addBankRow();
    addVehicleRow();
    addDocumentRow();
});

// ======================================
// NAVIGATION
// ======================================
function showStep(step) {
    formSteps.forEach((form) => form.classList.remove("active"));
    steps.forEach((item) => item.classList.remove("active"));
    formSteps[step - 1].classList.add("active");
    steps[step - 1].classList.add("active");
    currentStep = step;
}

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

function prevStep() {
    let targetStep = currentStep - 1;
    if (targetStep < 1) targetStep = 1;
    showStep(targetStep);
}

// ======================================
// EXTERNAL API (Countries & States)
// ======================================
async function fetchCountries() {
    const countryEl = document.getElementById('country-dropdown');
    const stateEl = document.getElementById('state-dropdown');
    
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states');
        const data = await response.json();

        if (!data.error) {
            countryEl.innerHTML = '<option value="" disabled selected>-Select-</option>';
            const sortedCountries = data.data.sort((a, b) => a.name.localeCompare(b.name));

            sortedCountries.forEach(country => {
                const opt = document.createElement('option');
                opt.value = country.name;
                opt.textContent = country.name;
                opt.dataset.states = JSON.stringify(country.states);
                countryEl.appendChild(opt);
            });
        }
    } catch (error) {
        countryEl.innerHTML = '<option value="" disabled selected>Failed to load countries</option>';
    }

    countryEl.addEventListener('change', (e) => {
        const selectedOption = countryEl.options[countryEl.selectedIndex];
        const states = JSON.parse(selectedOption.dataset.states || '[]');

        stateEl.innerHTML = '<option value="" disabled selected>-Select-</option>';
        if (states.length > 0) {
            stateEl.removeAttribute('disabled');
            states.sort((a, b) => a.name.localeCompare(b.name)).forEach(state => {
                const opt = document.createElement('option');
                opt.value = state.name;
                opt.textContent = state.name;
                stateEl.appendChild(opt);
            });
        } else {
            stateEl.setAttribute('disabled', 'true');
            stateEl.innerHTML = '<option value="" disabled selected>N/A (No states found)</option>';
        }
    });
}

// ======================================
// STEP 1: PERSONAL DETAILS
// ======================================
function savePersonalDetails() {
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
function addDependentRow() {
    const tbody = document.querySelector("#customSubformTable tbody");
    const newRow = document.createElement("tr");
    newRow.className = "subform-row";
    newRow.style.borderBottom = "1px solid #edf2f7";
    newRow.innerHTML = `
        <td style="padding: 8px 0; text-align: center;">
            <button type="button" onclick="removeDependentRow(this)" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold; font-size: 18px;">&times;</button>
        </td>
        <td style="padding: 8px 0;">
            <input type="text" class="dep-name" placeholder="Dependent Name" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;">
        </td>
        <td style="padding: 8px 0;">
            <select class="dep-relationship" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none; background: #fff; color: #333;">
                <option value="" disabled selected>-Select-</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Step Child">Step Child</option>
                <option value="Eligible Foster Child">Eligible Foster Child</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Half Brother">Half Brother</option>
                <option value="Half Sister">Half Sister</option>
                <option value="Step Brother">Step Brother</option>
                <option value="Step Sister">Step Sister</option>
                <option value="Adopted Child">Adopted Child</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Grand Parent">Grand Parent</option>
                <option value="Step Mother">Step Mother</option>
                <option value="Step Father">Step Father</option>
                <option value="In-law">In-law</option>
            </select>
        </td>
        <td style="padding: 8px 0;">
            <input type="date" class="dep-dob" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none; color: #333;">
        </td>
        <td style="padding: 8px 0;">
            <input type="text" class="dep-ssn" placeholder="XXX-XX-XXXX" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;">
        </td>
        <td style="padding: 8px 0; text-align: center;">
            <input type="checkbox" class="dep-student" style="width:20px; height:20px; cursor: pointer; accent-color: #4a90e2; vertical-align: middle;">
        </td>
    `;
    tbody.appendChild(newRow);
}

function removeDependentRow(button) {
    const rows = document.querySelectorAll("#customSubformTable .subform-row");
    if (rows.length > 1) button.closest("tr").remove();
}

function serializeDependentsSubform() {
    const rows = document.querySelectorAll("#customSubformTable .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const nameInput = row.querySelector(".dep-name");
        if (!nameInput) return;

        const fullName = nameInput.value.trim();
        const relationship = row.querySelector(".dep-relationship").value;
        const dob = row.querySelector(".dep-dob").value;
        const ssn = row.querySelector(".dep-ssn").value.trim();
        const isStudentChecked = row.querySelector(".dep-student").checked;

        if (fullName) {
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            dataArray.push({
                "Dependent_Name": JSON.stringify({ first_name: firstName, last_name: lastName, status: "edit" }),
                "Dependent_Relationship_to_you": relationship,
                "Date_of_Birth": dob,
                "SSN": ssn,
                "Is_dependent_full_time_Student": isStudentChecked ? "zc_checked" : "zc_unchecked",
                "record::status": "added",
                "row::key": `t::row_${index + 1}`
            });
        }
    });
    return dataArray;
}

function saveHouseholdDetails() {
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

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Household_Dependents", data: formData
    }).then(function(response) {
        if (response.code === 3000) {
            alert("Household Details Saved");
            householdRecordId = response.data.ID;
            const btn = formSteps[stepIndex].querySelector("#educationBtn");
            btn.innerText = "Update & Next";
            btn.onclick = updateHouseholdDetails;
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
function addBankRow() {
    const tbody = document.querySelector("#customSubformTableBANK tbody");
    const newRow = document.createElement("tr");
    newRow.className = "subform-row";
    newRow.style.borderBottom = "1px solid #edf2f7";
    newRow.innerHTML = `
        <td style="padding: 8px 0; text-align: center;">
            <button type="button" onclick="removeBankRow(this)" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold; font-size: 18px;">&times;</button>
        </td>
        <td style="padding: 8px 0;">
            <input type="text" class="bank-name" placeholder="Bank Name" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;">
        </td>
        <td style="padding: 8px 0;">
            <select class="bank-type" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none; background: #fff; color: #333;">
                <option value="" disabled selected>-Select-</option>
                <option value="Saving">Saving</option>
                <option value="Current">Current</option>
                <option value="Joint Account">Joint Account</option>
            </select>
        </td>
        <td style="padding: 8px 0; text-align: center;">
            <div><input type="number" class="bank-balance" placeholder="$ ##,###,###" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;" /></div>
        </td>
    `;
    tbody.appendChild(newRow);
}

function removeBankRow(button) {
    const rows = document.querySelectorAll("#customSubformTableBANK .subform-row");
    if (rows.length > 1) button.closest("tr").remove();
}

function serializeBankSubform() {
    const rows = document.querySelectorAll("#customSubformTableBANK .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const bankName = row.querySelector(".bank-name").value.trim();
        const bankType = row.querySelector(".bank-type").value;
        const balance = row.querySelector(".bank-balance").value.trim();

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
    return dataArray;
}

function saveBankDetails() {
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
function addVehicleRow() {
    const tbody = document.querySelector("#customSubformTablevehicle tbody");
    const newRow = document.createElement("tr");
    newRow.className = "subform-row";
    newRow.style.borderBottom = "1px solid #edf2f7";
    newRow.innerHTML = `
        <td style="padding: 8px 0; text-align: center;">
            <button type="button" onclick="removeVehicleRow(this)" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold; font-size: 18px;">&times;</button>
        </td>
        <td style="padding: 8px 0;">
            <input type="text" class="vehicle-make" placeholder="Make" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;">
        </td>
        <td style="padding: 8px 0;">
            <input type="text" class="vehicle-model" placeholder="Model" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;">
        </td>
        <td style="padding: 8px 0; text-align: center;">
            <div><input type="number" class="vehicle-value" placeholder="$ ##,###,###" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;" /></div>
        </td>
    `;
    tbody.appendChild(newRow);
}

function removeVehicleRow(button) {
    const rows = document.querySelectorAll("#customSubformTablevehicle .subform-row");
    if (rows.length > 1) button.closest("tr").remove();
}

function serializeVehicleSubform() {
    const rows = document.querySelectorAll("#customSubformTablevehicle .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const make = row.querySelector(".vehicle-make").value.trim();
        const model = row.querySelector(".vehicle-model").value.trim();
        const value = row.querySelector(".vehicle-value").value.trim();

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
    return dataArray;
}

function saveVehicleDetails() {
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
// CONFIRMATION MODAL LOGIC
// ======================================
let currentSubmitAction = '';

function showSubmitModal(action) {
    currentSubmitAction = action;
    let modal = document.getElementById("confirmSubmitModal");
    
    if (!modal) {
        // Create full-page modal dynamically
        modal = document.createElement("div");
        modal.id = "confirmSubmitModal";
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f4f5f7; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                
                <div style="background: white; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; box-sizing: border-box;">
                    
                    <div style="width: 80px; height: 80px; background: #8b0000; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; margin-bottom: 30px;">
                        ✓
                    </div>

                    <h1 style="color: #2b3d63; font-size: 36px; margin-bottom: 20px;">Ready to Submit?</h1>
                    
                    <p style="color: #4a5568; font-size: 20px; line-height: 1.6; max-width: 600px; margin-bottom: 50px;">
                        You are about to finalize and submit all of your personal details, financial information, and attached documents. <br><br>
                        This action will finalize your record.
                    </p>
                    
                    <div style="display: flex; gap: 30px; flex-wrap: wrap; justify-content: center;">
                        <button type="button" onclick="closeSubmitModal()" style="background: transparent; color: #4a5568; border: 2px solid #c5cae4; padding: 15px 40px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 18px; transition: all 0.2s;">
                            Review
                        </button>
                        
                        <button type="button" onclick="confirmSubmit()" style="background: #8b0000; color: white; border: 2px solid #8b0000; padding: 15px 50px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 18px; transition: all 0.2s;">
                            Submit
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Disable scrolling on the main page while the full-page modal is open
    document.body.style.overflow = "hidden";
    modal.style.display = "block";
}

function closeSubmitModal() {
    const modal = document.getElementById("confirmSubmitModal");
    if (modal) {
        modal.style.display = "none";
        // Re-enable scrolling when closed
        document.body.style.overflow = "auto";
    }
}

function confirmSubmit() {
    closeSubmitModal();
    // Route to correct function based on what triggered the modal
    if (currentSubmitAction === 'save') {
        executeSaveDocumentsDetails();
    } else if (currentSubmitAction === 'update') {
        executeUpdateDocumentsDetails();
    }
}

// ======================================
// STEP 8: DOCUMENTS DETAILS
// ======================================

// Intercept original functions to show the modal first
function saveDocumentsDetails() {
    showSubmitModal('save');
}

function updateDocumentsDetails() {
    showSubmitModal('update');
}
// =====================================
// ROW GENERATION & FILE TRACKING
// =====================================
const inputStyle = 'width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none; box-sizing: border-box;';

// Global object to track files by their unique row ID
let subformFileTracker = {};

function addDocumentRow() {
    const tbody = document.querySelector("#customSubformTableDOCS tbody");
    const newRow = document.createElement("tr");
    newRow.className = "subform-row";
    
    // 1. Generate a unique ID for this UI row
    const rowId = 'row_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    newRow.setAttribute("data-ui-row-id", rowId);
    
    // 2. Initialize tracking for this row
    subformFileTracker[rowId] = { typeOne: null, typeTwo: null };

    newRow.style.borderBottom = "1px solid #edf2f7";
    newRow.innerHTML = `
        <td style="padding: 8px 0; text-align: center;">
            <button type="button" onclick="removeDocumentRow(this)" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold; font-size: 18px;">&times;</button>
        </td>
        <td style="padding: 8px 0;"><input type="text" class="sf-client" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-document" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-doc-type" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-doc-name" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="file" multiple class="sf-doc-file" style="${inputStyle}" onchange="handleRowFile(this, 'typeOne')"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-doc-desc" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="file" multiple class="sf-up-file1" style="${inputStyle}" onchange="handleRowFile(this, 'typeTwo')"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-case" style="${inputStyle}"></td>
        <td style="padding: 8px 0;">
            <select class="sf-year" style="${inputStyle}">
                <option value="" disabled selected>- Year -</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
            </select>
        </td>
        <td style="padding: 8px 0;"><input type="date" class="sf-up-due" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-up-date" placeholder="DD-MMM-YYYY" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-up-by" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-workdrive-url" placeholder="URL" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-workdrive-id" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-cpa" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-status" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-priority" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-staff-comm" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-record-id" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-rev-by" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-rev-comm" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="date" class="sf-rev-on" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-assigned-rev" style="${inputStyle}"></td>
    `;
    tbody.appendChild(newRow);
}

function removeDocumentRow(button) {
    const rows = document.querySelectorAll("#customSubformTableDOCS .subform-row");
    if (rows.length > 1) {
        const row = button.closest("tr");
        const rowId = row.getAttribute("data-ui-row-id");
        delete subformFileTracker[rowId]; // Clean up memory
        row.remove();
    }
}

function handleRowFile(inputElement, type) {
    const row = inputElement.closest("tr");
    const rowId = row.getAttribute("data-ui-row-id");
    
    if (inputElement.files.length > 0) {
       subformFileTracker[rowId][type] = Array.from(inputElement.files);
    } else {
        subformFileTracker[rowId][type] = null;
    }
}

// =====================================
// DATA SERIALIZATION
// =====================================
function getVal(row, selector) {
    const el = row.querySelector(selector);
    if (!el) return "";
    let val = el.value.trim();
    if (val === "-Select-" || val === "- Year -") return "";
    return val;
}

function serializeDocumentSubform() {
    const rows = document.querySelectorAll("#customSubformTableDOCS .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const rawUrl = getVal(row, ".sf-workdrive-url");
        const urlFieldObj = rawUrl ? JSON.stringify({ "Workdrive_URL": rawUrl, "zcurl": "", "zctarget": "new" }) : JSON.stringify({ "Workdrive_URL": "", "zcurl": "", "zctarget": "new" });

        // Check if this row already exists in Zoho
        const zohoRowId = row.getAttribute("data-zoho-row-id");
        
        let rowPayload = {
            "Client": getVal(row, ".sf-client"),
            "Document": getVal(row, ".sf-document"),
            "Document_Type": getVal(row, ".sf-doc-type"),
            "Document_Name": getVal(row, ".sf-doc-name"),
            "Document_Desciption": getVal(row, ".sf-doc-desc"),
            "Case": getVal(row, ".sf-case"),
            "Year_field": getVal(row, ".sf-year"),
            "Upload_Due_Date": getVal(row, ".sf-up-due"),
            "Upload_Date": getVal(row, ".sf-up-date"), 
            "Uploaded_By": getVal(row, ".sf-up-by"),
            "Workdrive_URL": urlFieldObj,
            "WorkDrive_File_ID": getVal(row, ".sf-workdrive-id"),
            "Assigned_CPA": getVal(row, ".sf-cpa"),
            "Status": getVal(row, ".sf-status"),
            "Priority": getVal(row, ".sf-priority"),
            "Staff_Comments": getVal(row, ".sf-staff-comm"),
            "Record_ID": getVal(row, ".sf-record-id"),
            "Reviewed_By": getVal(row, ".sf-rev-by"),
            "Review_Comments": getVal(row, ".sf-rev-comm"),
            "Reviewed_On": getVal(row, ".sf-rev-on"),
            "Assigned_Reviewer": getVal(row, ".sf-assigned-rev")
        };

        if (zohoRowId) {
            // It's an existing row
            rowPayload["id"] = zohoRowId;
            rowPayload["record::status"] = "updated";
        } else {
            // It's a new row being added
            rowPayload["record::status"] = "added";
            rowPayload["row::key"] = `t::row_${index + 1}`;
        }

        dataArray.push(rowPayload);
    });
    return dataArray;
}
// =====================================
// SAVE & UPLOAD EXECUTION
// =====================================
function executeSaveDocumentsDetails() {
    const stepIndex = 7;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Personal_Master: formSteps[stepIndex].querySelector("#Personal_Master").value,
            Entity_Master: formSteps[stepIndex].querySelector("#Entity_Master").value,
            Documents: serializeDocumentSubform() 
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, 
        formName: "Document_Upload_Wizard", 
        data: formData
    }).then(async function(response) {
        if (response.code == 3000) {
            documentsRecordId = response.data.ID;
            console.log("Parent Record Created. ID:", documentsRecordId);

            try {
                // Fetch the newly created record to get Subform Row IDs
                const recordDetails = await ZOHO.CREATOR.API.getRecordById({
                    appName: APP_NAME,
                    reportName: "All_Document_Upload_Wizards", 
                    id: documentsRecordId
                });
                    console.log(recordDetails);
                const subformRows = recordDetails.data.Documents; 
                
                // Trigger the upload process, passing the fetched rows
                await uploadAllWizardFiles(subformRows);

                alert("Documents & Files Saved Successfully!");
                const btn = formSteps[stepIndex].querySelectorAll("button")[1]; 
                btn.innerText = "Update Final";
                btn.onclick = updateDocumentsDetails; 
                steps[stepIndex].classList.add("completed");

            } catch (error) {
                console.error("Failed to fetch subform rows or upload files:", error);
                alert("Text saved, but file uploads failed. Check console.");
            }
        } else {
            console.error("Save Failed:", response.error);
            alert("Failed to save documents.");
        }
    });
}
function executeUpdateDocumentsDetails() {
    const stepIndex = 7;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Personal_Master: formSteps[stepIndex].querySelector("#Personal_Master").value,
            Entity_Master: formSteps[stepIndex].querySelector("#Entity_Master").value,
            Documents: serializeDocumentSubform() 
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, 
        reportName: "All_Document_Upload_Wizards", 
        id: documentsRecordId,
        data: formData
    }).then(async function(response) {
        if (response.code == 3000) {
            console.log("Parent Record Updated.");

            try {
                // Re-fetch the record to get IDs for any newly added rows
                const recordDetails = await ZOHO.CREATOR.API.getRecordById({
                    appName: APP_NAME,
                    reportName: "All_Document_Upload_Wizards", 
                    id: documentsRecordId
                });
                
                const subformRows = recordDetails.data.Documents; 
                
                // Trigger the upload process
                await uploadAllWizardFiles(subformRows);

                alert("Documents & Files Updated Successfully!");
            } catch (error) {
                console.error("Failed to fetch subform rows or upload files:", error);
                alert("Text updated, but file uploads failed. Check console.");
            }
        } else {
            console.error("Update Failed:", response.error);
            alert("Failed to update documents.");
        }
    });
}

async function uploadAllWizardFiles(savedZohoRows) {
    const uiRows = document.querySelectorAll("#customSubformTableDOCS .subform-row");

    for (let i = 0; i < uiRows.length; i++) {
        let uiRowId = uiRows[i].getAttribute("data-ui-row-id");
        let filesToUpload = subformFileTracker[uiRowId];
        
        // See if we already stored the Zoho ID, otherwise pull it from the fresh response
        let zohoSubformRowId = uiRows[i].getAttribute("data-zoho-row-id");
        
        if (!zohoSubformRowId && savedZohoRows[i]) {
            zohoSubformRowId = savedZohoRows[i].ID;
            // Store it in the DOM for future updates
            uiRows[i].setAttribute("data-zoho-row-id", zohoSubformRowId); 
        }

        if (zohoSubformRowId && filesToUpload) {
            // Loop and upload all files for typeOne (sf-doc-file)
            if (filesToUpload.typeOne && filesToUpload.typeOne.length > 0) {
                for (let file of filesToUpload.typeOne) {
                    await uploadSingleFile("Document_File", file, zohoSubformRowId);
                }
                filesToUpload.typeOne = null; // Clear from memory to prevent re-upload
            }
            
            // Loop and upload all files for typeTwo (sf-up-file1)
            if (filesToUpload.typeTwo && filesToUpload.typeTwo.length > 0) {
                for (let file of filesToUpload.typeTwo) {
                    await uploadSingleFile("Upload_File1", file, zohoSubformRowId);
                }
                filesToUpload.typeTwo = null; // Clear from memory to prevent re-upload
            }
        }
    }
}

function uploadSingleFile(fieldName, file, subformRowId) {
    // The ID provided here is now properly the SUBFORM row ID, and syntax is fixed
    return ZOHO.CREATOR.API.uploadFile({
        appName: APP_NAME,
        reportName: "All_Document_Upload_Wizards",
        id: subformRowId, 
        parentId:documentsRecordId,
        fieldName: "Documents." +fieldName,
        file: file
    });
}