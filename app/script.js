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
// MASTER RECORD (A_Intake) SYNC LOGIC
// ======================================
let masterRecordId = null;
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";

    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;

    document.body.appendChild(toast);

    let timeout;

    const removeToast = () => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 300);
    };

    const startTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(removeToast, 2000);
    };

    const stopTimer = () => {
        clearTimeout(timeout);
    };

    // Start auto-dismiss timer
    startTimer();

    // Pause timer on hover
    toast.addEventListener("mouseenter", stopTimer);

    // Resume timer on mouse leave
    toast.addEventListener("mouseleave", startTimer);

    // Close button
    toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(timeout);
        removeToast();
    });
}

function syncMasterRecord(stepNum, stepRecordId, isFinalSubmit = false) {
    return new Promise((resolve) => {
        // Retrieve A_Master ID from DOM if not already in memory
        if (!masterRecordId) {
            const masterInput = document.querySelector("#A_Master");
            if (masterInput && masterInput.value) {
                masterRecordId = masterInput.value;
            }
        }

        // Dynamically compute completed steps array based on active IDs
        let completed = [];
        if (personalRecordId) completed.push("1");
        if (householdRecordId) completed.push("2");
        if (employmentRecordId) completed.push("3");
        if (incomeRecordId) completed.push("4");
        if (expensesRecordId) completed.push("5");
        if (bankRecordId) completed.push("6");
        if (vehicleRecordId) completed.push("7");
        if (documentsRecordId || stepNum === 8) completed.push("8");
        
        // Ensure current step is tracked
        if (!completed.includes(stepNum.toString())) {
            completed.push(stepNum.toString());
        }

        const stepFieldMap = {
            1: "A_Personal_Information",
            2: "A_Household_Dependents",
            3: "A_Employment",
            4: "A_Income",
            5: "A_Expenses",
            6: "A_Bank_Accounts",
            7: "A_Assets",
            8: "Document_Upload_Wizard"
        };

        const currentDate = formatZohoDate(new Date().toISOString().split('T')[0]);

        let masterData = {
            data: {
                "Current_Step": isFinalSubmit ? 8 : stepNum + 1,
                "Completed_Steps": completed,
                "Completed_Steps1": completed.length,
                "Status": isFinalSubmit ? "Submitted" : "In Progress"
            }
        };

        // Assign specific step record ID to the correct lookup field
        if (stepFieldMap[stepNum] && stepRecordId) {
            masterData.data[stepFieldMap[stepNum]] = stepRecordId.toString();
        }

        if (isFinalSubmit) {
            masterData.data["Submitted_On"] = currentDate;
            masterData.data["Status"] = "Submitted";
        }

        // Create Master Record if it's Step 1 and doesn't exist
        if (stepNum === 1 && !masterRecordId) {
            masterData.data["Started_On"] = currentDate;
            
            // Safe fetch of base field values for initialization
            const clientInput = document.querySelector("#Clients");
            const caseInput = document.querySelector("#Case");
            const cpaInput = document.querySelector("#Assigned_CPA");
            
            masterData.data["Client"] = clientInput ? clientInput.value : "";
            masterData.data["Case"] = caseInput ? caseInput.value : "";
            masterData.data["Assigned_CPA"] = cpaInput ? cpaInput.value : "";

            ZOHO.CREATOR.API.addRecord({
                appName: APP_NAME,
                formName: "A_Master",
                data: masterData
            }).then(function(response) {
                if (response.code == 3000) {
                    masterRecordId = response.data.ID;
                    // Auto-fill all #A_Master hidden inputs across steps
                    document.querySelectorAll("#A_Master").forEach(input => input.value = masterRecordId);
                    resolve(masterRecordId);
                } else {
                    console.error("Master Record Creation Failed:", response);
                    resolve(null);
                }
            });
        } else if (masterRecordId) {
            // Update Existing Master Record for all subsequent steps
            ZOHO.CREATOR.API.updateRecord({
                appName: APP_NAME,
                reportName: "A_Intakes",
                id: masterRecordId,
                data: masterData
            }).then(function(response) {
                if (response.code == 3000) {
                    resolve(masterRecordId);
                } else {
                    console.error("Master Record Update Failed:", response);
                    resolve(null);
                }
            });
        } else {
            resolve(null);
        }
    });
}

// ======================================
// INIT
// ======================================
ZOHO.CREATOR.init().then(function () {
    console.log("Widget Initialized");
    try {
        // Using getQueryParams() as per the standard Zoho Widget SDK
        var queryParams = ZOHO.CREATOR.UTIL.getQueryParams();
        console.log("Extracted Query Parameters:", queryParams);

        if (queryParams) {
            // 1. Populate Client ID
            if (queryParams.clid) {
                document.querySelectorAll("#Clients").forEach(input => input.value = queryParams.clid);
            }

            // 2. Populate Case ID 
            const caseValue = queryParams.caseid || queryParams.cid;
            if (caseValue) {
                document.querySelectorAll("#Case").forEach(input => input.value = caseValue);
            }

            // 3. Populate Master ID and update global state
            if (queryParams.masterid) {
                document.querySelectorAll("#A_Master").forEach(input => input.value = queryParams.masterid);
                masterRecordId = queryParams.masterid; 
            }

            // 4. Populate Full Legal Name
            if (queryParams.Full_legal_name) {
                const nameInput = document.querySelector("#Full_legal_name");
                if (nameInput) nameInput.value = decodeURIComponent(queryParams.Full_legal_name);
            }
        }
    } catch (error) {
        console.error("Error fetching parameters from Zoho API:", error);
    }
});

document.addEventListener("DOMContentLoaded", function() {
    fetchCountries();
    // Initialize one row for each subform
    addDependentRow();
    addBankRow();
    addVehicleRow();
    addDocumentRow();
    updateNavButtons(currentStep);
    
    const claimDependentsSelect = document.querySelector("#Do_you_claim_dependents");
    if (claimDependentsSelect) {
        claimDependentsSelect.addEventListener("change", toggleDependentSubform);
        toggleDependentSubform(); 
    }
    const claimDependentsSelectbank = document.querySelector("#Do_you_have_bank_accounts");
    if (claimDependentsSelectbank) {
        claimDependentsSelectbank.addEventListener("change", toggleDependentSubformBank);
        toggleDependentSubformBank(); 
    }
    const claimDependentsSelectasset = document.querySelector("#Do_you_own_a_vehicle");
    if (claimDependentsSelectasset) {
        claimDependentsSelectasset.addEventListener("change", toggleDependentSubformAsset);
        toggleDependentSubformAsset(); 
    }
});

// ======================================
// NAVIGATION
// ======================================

function nextStep() {
    let targetStep = currentStep + 1;
    if (targetStep > formSteps.length) targetStep = formSteps.length;
    goToStep(targetStep);
}

function showStep(step) {
    formSteps.forEach((form) => form.classList.remove("active"));
    steps.forEach((item) => item.classList.remove("active"));
    formSteps[step - 1].classList.add("active");
    steps[step - 1].classList.add("active");
    currentStep = step;
    updateNavButtons(currentStep);
}

function goToStep(step) {
    if (step == 1) { showStep(1); }
    else if (step == 2) { personalRecordId ? showStep(2) : showToast("Please complete Personal Details first"); }
    else if (step == 3) { householdRecordId ? showStep(3) : showToast("Please complete Household Details first"); }
    else if (step == 4) { employmentRecordId ? showStep(4) : showToast("Please complete Employment Details first"); }
    else if (step == 5) { incomeRecordId ? showStep(5) : showToast("Please complete Income Details first"); }
    else if (step == 6) { expensesRecordId ? showStep(6) : showToast("Please complete Expenses Details first"); }
    else if (step == 7) { bankRecordId ? showStep(7) : showToast("Please complete Bank Details first"); }
    else if (step == 8) { vehicleRecordId ? showStep(8) : showToast("Please complete Assets Details first"); }
}

function prevStep() {
    let targetStep = currentStep - 1;
    if (targetStep < 1) targetStep = 1;
    showStep(targetStep);
}

// ======================================
// EXTERNAL API (Countries & States)
// ======================================
function fetchCountries() {
    const countryEl = document.getElementById('country-dropdown');
    const stateEl = document.getElementById('state-dropdown');
    
    try {
        countryEl.innerHTML = '<option value="" disabled selected>-Select-</option>';
        const sortedCountries = localCountryData.sort((a, b) => a.name.localeCompare(b.name));

        sortedCountries.forEach(country => {
            const opt = document.createElement('option');
            opt.value = country.name;
            opt.textContent = country.name;
            opt.dataset.states = JSON.stringify(country.states);
            countryEl.appendChild(opt);
        });
        
    } catch (error) {
        console.error("Error loading local countries:", error);
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
// UTILITIES
// ======================================
function updateNavButtons(step) {
    const mobilePrev = document.getElementById('mobilePrevBtn');
    const mobileNext = document.getElementById('mobileNextBtn');
    
    if (mobilePrev) {
        mobilePrev.disabled = (step === 1);
    }
    if (mobileNext) {
        mobileNext.disabled = (step === formSteps.length);
    }

    const desktopPrevs = document.querySelectorAll('button[onclick="prevStep()"]');
    const desktopNexts = document.querySelectorAll('button[onclick="nextStep()"]');
    
    desktopPrevs.forEach(btn => btn.disabled = (step === 1));
    desktopNexts.forEach(btn => btn.disabled = (step === formSteps.length));
}

function formatZohoDate(dateString) {
    if (!dateString) return "";
    
    const parts = dateString.split("-"); 
    if (parts.length !== 3) return dateString; 

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1];
    const day = parts[2];

    return `${day}-${month}-${year}`;
}

function toggleDependentSubformAsset() {
    const claimDependentsSelectasset = document.querySelector("#Do_you_own_a_vehicle");
    const subformTableasset = document.querySelector("#customSubformTablevehicle");
    const subformContainerasset = subformTableasset.closest(".custom-subform-container");
    
    if (claimDependentsSelectasset.value === "No") {
        subformTableasset.style.display = "none";
        subformContainerasset.style.display = "none";
        
        const tbody = subformTableasset.querySelector("tbody");
        tbody.innerHTML = ""; 
        addDependentRow(); 
    } else {
        subformTableasset.style.display = "table"; 
        subformContainerasset.style.display = "table";
    }
}

function toggleDependentSubform() {
    const claimDependentsSelect = document.querySelector("#Do_you_claim_dependents");
    const subformTable = document.querySelector("#customSubformTable");
    const subformContainer = subformTable.closest(".custom-subform-container");
    
    if (claimDependentsSelect.value === "No") {
        subformTable.style.display = "none";
        subformContainer.style.display = "none";
        
        const tbody = subformTable.querySelector("tbody");
        tbody.innerHTML = ""; 
        addDependentRow(); 
    } else {
        subformTable.style.display = "table"; 
        subformContainer.style.display = "table";
    }
}

function toggleDependentSubformBank() {
    const claimDependentsSelectbank = document.querySelector("#Do_you_have_bank_accounts");
    const subformTablebank = document.querySelector("#customSubformTableBANK");
    const subformContainerbank = subformTablebank.closest(".custom-subform-container");
    
   if (claimDependentsSelectbank.value === "No") {
        subformTablebank.style.display = "none";
        subformContainerbank.style.display = "none";
        
        const tbody = subformTablebank.querySelector("tbody");
        tbody.innerHTML = ""; 
        addBankRow(); 
    } else {
        subformTablebank.style.display = "table"; 
        subformContainerbank.style.display = "table";
    }
}

// ======================================
// STEP 1: PERSONAL DETAILS
// ======================================
function savePersonalDetails() {
    const stepIndex = 0;
    const homeAddress = {
        address_line_1: formSteps[stepIndex].querySelector("#address-line-1").value,
        address_line_2: formSteps[stepIndex].querySelector("#address-line-2").value,
        district_city: formSteps[stepIndex].querySelector("#city-district").value,
        state_province: formSteps[stepIndex].querySelector("#state-dropdown").value,
        postal_Code: formSteps[stepIndex].querySelector("#postal-code").value,
        country: formSteps[stepIndex].querySelector("#country-dropdown").value,
    };
    
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Full_legal_name: formSteps[stepIndex].querySelector("#Full_legal_name").value,
            Social_Security_Number_SSN: formSteps[stepIndex].querySelector("#Social_Security_Number_SSN").value,
            Email_Address: formSteps[stepIndex].querySelector("#Email_Address").value,
            Primary_Phone_Number: formSteps[stepIndex].querySelector("#Primary_Phone_Number").value,
            Date_of_birth: formatZohoDate(formSteps[stepIndex].querySelector("#Date_of_birth").value),
            Marital_Status: formSteps[stepIndex].querySelector("#Marital_Status").value,
            Spouse_Full_Name: formSteps[stepIndex].querySelector("#Spouse_Full_Name").value,
            Spouse_SSN: formSteps[stepIndex].querySelector("#Spouse_SSN").value,
            Home_address: homeAddress
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Personal_Information", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            personalRecordId = response.data.ID;
            
            syncMasterRecord(1, personalRecordId).then(() => {
                showToast("Personal Details Saved");
                const btn = formSteps[stepIndex].querySelector("#basicBtn");
                btn.innerText = "Update & Next";
                btn.onclick = updatePersonalDetails;
                
                steps[0].classList.add("completed");
                showStep(2);
            });
        }
    });
}

function updatePersonalDetails() {
    const stepIndex = 0;
    const homeAddress = {
        address_line_1: formSteps[stepIndex].querySelector("#address-line-1").value,
        address_line_2: formSteps[stepIndex].querySelector("#address-line-2").value,
        district_city: formSteps[stepIndex].querySelector("#city-district").value,
        state_province: formSteps[stepIndex].querySelector("#state-dropdown").value,
        postal_Code: formSteps[stepIndex].querySelector("#postal-code").value,
        country: formSteps[stepIndex].querySelector("#country-dropdown").value,
    };
    
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Full_legal_name: formSteps[stepIndex].querySelector("#Full_legal_name").value,
            Social_Security_Number_SSN: formSteps[stepIndex].querySelector("#Social_Security_Number_SSN").value,
            Email_Address: formSteps[stepIndex].querySelector("#Email_Address").value,
            Primary_Phone_Number: formSteps[stepIndex].querySelector("#Primary_Phone_Number").value,
            Date_of_birth: formatZohoDate(formSteps[stepIndex].querySelector("#Date_of_birth").value),
            Marital_Status: formSteps[stepIndex].querySelector("#Marital_Status").value,
            Spouse_Full_Name: formSteps[stepIndex].querySelector("#Spouse_Full_Name").value,
            Spouse_SSN: formSteps[stepIndex].querySelector("#Spouse_SSN").value,
            Home_address: homeAddress
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "All_433_a_personal_Information", id: personalRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            syncMasterRecord(1, personalRecordId).then(() => {
                showToast("Personal Details Updated");
                showStep(2);
            });
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
                </select>
        </td>
        <td style="padding: 8px 0;">
            <input type="date" class="dep-dob" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none; color: #333;">
        </td>
        <td style="padding: 8px 0;">
            <input type="text" class="dep-ssn" placeholder="XXX-XX-XXXX" style="width:92%; height:34px; padding:0 8px; border:1px solid #c5cae4; border-radius:6px; outline:none;">
        </td>
        <td style="padding: 8px 0; text-align: center;">
            <input type="checkbox" class="dep-student" style="width:20px; height:20px; cursor: pointer; accent-color: #8b0000; vertical-align: middle;">
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
        const dob = formatZohoDate(row.querySelector(".dep-dob").value);
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
    const claimsDependents = formSteps[stepIndex].querySelector("#Do_you_claim_dependents").value;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Number_of_people_in_household: formSteps[stepIndex].querySelector("#Number_of_people_in_household").value,
            Do_you_claim_dependents: claimsDependents,
            Dependents: claimsDependents === "Yes" ? serializeDependentsSubform() : []
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Household_Dependents", data: formData
    }).then(function(response) {
        if (response.code === 3000) {
            householdRecordId = response.data.ID;
            
            syncMasterRecord(2, householdRecordId).then(() => {
                showToast("Household Details Saved");
                const btn = formSteps[stepIndex].querySelector("#educationBtn");
                btn.innerText = "Update & Next";
                btn.onclick = updateHouseholdDetails;
                steps[stepIndex].classList.add("completed");
                showStep(3);
            });
        }
    });
}

function updateHouseholdDetails() {
    const stepIndex = 1;
        const claimsDependents = formSteps[stepIndex].querySelector("#Do_you_claim_dependents").value;

    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Number_of_people_in_household: formSteps[stepIndex].querySelector("#Number_of_people_in_household").value,
            Do_you_claim_dependents: claimsDependents,
            Dependents: claimsDependents === "Yes" ? serializeDependentsSubform() : []
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "A_Household_Dependents_Report", id: householdRecordId, data: formData
    }).then(function(response) {
        if (response.code === 3000) {
            syncMasterRecord(2, householdRecordId).then(() => {
                showToast("Household Details Updated");
                showStep(3);
            });
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
            employmentRecordId = response.data.ID;
            
            syncMasterRecord(3, employmentRecordId).then(() => {
                showToast("Employment Details Saved");
                const btn = formSteps[stepIndex].querySelector(".btn-group button:last-child");
                btn.innerText = "Update & Next";
                btn.onclick = updateEmploymentDetails;
                
                steps[stepIndex].classList.add("completed");
                showStep(4);
            });
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
            syncMasterRecord(3, employmentRecordId).then(() => {
                showToast("Employment Details Updated");
                showStep(4);
            });
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
            incomeRecordId = response.data.ID;
            
            syncMasterRecord(4, incomeRecordId).then(() => {
                showToast("Income Details Saved");
                const btn = formSteps[stepIndex].querySelector(".btn-group button:last-child"); 
                btn.innerText = "Update & Next";
                btn.onclick = updateIncomeDetails;
                steps[stepIndex].classList.add("completed");
                showStep(5);
            });
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
            syncMasterRecord(4, incomeRecordId).then(() => {
                showToast("Income Details Updated");
                showStep(5);
            });
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
            Utilities_total: formSteps[stepIndex].querySelector("#Utilities_total").value,
            Food_and_Household_Expenses: formSteps[stepIndex].querySelector("#Food_and_Household_Expenses").value,
            Medical_Expenses: formSteps[stepIndex].querySelector("#Medical_Expenses").value,
            Transportation_Expenses: formSteps[stepIndex].querySelector("#Transportation_Expenses").value
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Expenses", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            expensesRecordId = response.data.ID;
            
            syncMasterRecord(5, expensesRecordId).then(() => {
                showToast("Expense Details Saved");
                const btn = formSteps[stepIndex].querySelector(".btn-group button:last-child"); 
                btn.innerText = "Update & Next";
                btn.onclick = updateExpensesDetails;
                steps[stepIndex].classList.add("completed");
                showStep(6);
            });
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
            Utilities_total: formSteps[stepIndex].querySelector("#Utilities_total").value,
            Food_and_Household_Expenses: formSteps[stepIndex].querySelector("#Food_and_Household_Expenses").value,
            Medical_Expenses: formSteps[stepIndex].querySelector("#Medical_Expenses").value,
            Transportation_Expenses: formSteps[stepIndex].querySelector("#Transportation_Expenses").value
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "A_Expenses_Report", id: expensesRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            syncMasterRecord(5, expensesRecordId).then(() => {
                showToast("Expense Details Updated");
                showStep(6);
            });
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
    const dobank = formSteps[stepIndex].querySelector("#Do_you_have_bank_accounts").value;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_have_bank_accounts: dobank,
            Bank_Account_Details: dobank === "Yes" ? serializeBankSubform() : []
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Bank_Accounts", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            bankRecordId = response.data.ID;
            
            syncMasterRecord(6, bankRecordId).then(() => {
                showToast("Bank Details Saved");
                const btn = formSteps[stepIndex].querySelector(".btn-group button:last-child"); 
                btn.innerText = "Update & Next";
                btn.onclick = updateBankDetails;
                steps[stepIndex].classList.add("completed");
                showStep(7);
            });
        }
    });
}

function updateBankDetails() {
    const stepIndex = 5;
    const dobank = formSteps[stepIndex].querySelector("#Do_you_have_bank_accounts").value;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_have_bank_accounts: dobank,
            Bank_Account_Details: dobank === "Yes" ? serializeBankSubform() : []
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "All_433_a_bank_Accounts", id: bankRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            syncMasterRecord(6, bankRecordId).then(() => {
                showToast("Bank Details Updated");
                showStep(7);
            });
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
                "Make": make,
                "Model": model,
                "Value": value,
                "record::status": "added",
                "row::key": `t::row_${index + 1}`
            });
        }
    });
    return dataArray;
}

function saveVehicleDetails() {
    const stepIndex = 6;
    const claimsDependentsasset = formSteps[stepIndex].querySelector("#Do_you_own_a_vehicle").value;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_own_a_vehicle: claimsDependentsasset,
            Vehicle_details: claimsDependentsasset === "Yes" ? serializeVehicleSubform() : []
        }
    };

    ZOHO.CREATOR.API.addRecord({
        appName: APP_NAME, formName: "A_Assets", data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            vehicleRecordId = response.data.ID;
            
            syncMasterRecord(7, vehicleRecordId).then(() => {
                showToast("Vehicle Details Saved");
                const btn = formSteps[stepIndex].querySelector(".btn-group button:last-child"); 
                btn.innerText = "Update & Next";
                btn.onclick = updateVehicleDetails;
                steps[stepIndex].classList.add("completed");
                showStep(8);
            });
        }
    });
}

function updateVehicleDetails() {
    const stepIndex = 6;
    const claimsDependentsasset = formSteps[stepIndex].querySelector("#Do_you_own_a_vehicle").value;
    const formData = {
        data: {
            Clients: formSteps[stepIndex].querySelector("#Clients").value,
            Case: formSteps[stepIndex].querySelector("#Case").value,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Do_you_own_a_vehicle: claimsDependentsasset,
            Vehicle_details: claimsDependentsasset === "Yes" ? serializeVehicleSubform() : []
        }
    };

    ZOHO.CREATOR.API.updateRecord({
        appName: APP_NAME, reportName: "All_Assets", id: vehicleRecordId, data: formData
    }).then(function(response) {
        if (response.code == 3000) {
            syncMasterRecord(7, vehicleRecordId).then(() => {
                showToast("Vehicle Details Updated");
                showStep(8);
            });
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
    if (currentSubmitAction === 'submit') {
       showToast("Request Submitted Successfully!");
       window.location.reload();
    }
}

// ======================================
// STEP 8: DOCUMENTS DETAILS
// ======================================

function saveDocumentsDetails() {
    executeSaveDocumentsDetails();
}

function updateDocumentsDetails() {
    executeUpdateDocumentsDetails();
}

// =====================================
// ROW GENERATION & FILE TRACKING
// =====================================
const inputStyle = 'width:92%; height:34px; padding:0 8px; border:1px solid #F0E0E4; border-radius:6px; outline:none; box-sizing: border-box;';
let subformFileTracker = {};

function addDocumentRow() {
    const tbody = document.querySelector("#customSubformTableDOCS tbody");
    const newRow = document.createElement("tr");
    newRow.className = "subform-row";
    
    const rowId = 'row_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    newRow.setAttribute("data-ui-row-id", rowId);
    subformFileTracker[rowId] = { typeOne: null, typeTwo: null };

    newRow.style.borderBottom = "1px solid #edf2f7";
    newRow.innerHTML = `
        <td style="padding: 8px 0; text-align: center;">
            <button type="button" onclick="removeDocumentRow(this)" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold; font-size: 18px;">&times;</button>
        </td>
        <td style="padding: 8px 0;display:none"><input type="text" class="sf-client" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-document" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-doc-type" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-doc-name" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="file" multiple class="sf-doc-file" style="${inputStyle}" onchange="handleRowFile(this, 'typeOne')"></td>
        <td style="padding: 8px 0;"><input type="text" class="sf-doc-desc" style="${inputStyle}"></td>
        <td style="padding: 8px 0;"><input type="file" multiple class="sf-up-file1" style="${inputStyle}" onchange="handleRowFile(this, 'typeTwo')"></td>
        <td style="padding: 8px 0;display:none"><input type="text" class="sf-case" style="${inputStyle}"></td>
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
        <td style="padding: 8px 0;"><input type="date" class="sf-up-date" placeholder="DD-MMM-YYYY" style="${inputStyle}"></td>
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
        delete subformFileTracker[rowId]; 
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

function getVal(row, selector) {
    const el = row.querySelector(selector);
    if (!el) return "";
    let val = el.value.trim();
    if (val === "-Select-" || val === "- Year -") return "";
    return val;
}

function serializeDocumentSubform(Clientsval,Caseval) {
    const rows = document.querySelectorAll("#customSubformTableDOCS .subform-row");
    let dataArray = [];

    rows.forEach((row, index) => {
        const rawUrl = getVal(row, ".sf-workdrive-url");
        const urlFieldObj = rawUrl ? JSON.stringify({ "Workdrive_URL": rawUrl, "zcurl": "", "zctarget": "new" }) : JSON.stringify({ "Workdrive_URL": "", "zcurl": "", "zctarget": "new" });

        const zohoRowId = row.getAttribute("data-zoho-row-id");
        
        let rowPayload = {
            "Client": Clientsval,
            "Document": getVal(row, ".sf-document"),
            "Document_Type": getVal(row, ".sf-doc-type"),
            "Document_Name": getVal(row, ".sf-doc-name"),
            "Document_Desciption": getVal(row, ".sf-doc-desc"),
            "Case": Caseval,
            "Year_field": getVal(row, ".sf-year"),
            "Upload_Due_Date":formatZohoDate( getVal(row, ".sf-up-due")),
            "Upload_Date": formatZohoDate(getVal(row, ".sf-up-date")), 
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
            "Reviewed_On": formatZohoDate(getVal(row, ".sf-rev-on")),
            "Assigned_Reviewer": getVal(row, ".sf-assigned-rev")
        };

        if (zohoRowId) {
            rowPayload["ID"] = zohoRowId;
            rowPayload["record::status"] = "updated";
        } else {
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
    const Clientsval= formSteps[stepIndex].querySelector("#Clients").value;
    const Caseval= formSteps[stepIndex].querySelector("#Case").value;
    const formData = {
        data: {
            Clients: Clientsval,
            Case: Caseval,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Personal_Master: formSteps[stepIndex].querySelector("#Personal_Master").value,
            Entity_Master: formSteps[stepIndex].querySelector("#Entity_Master").value,
            Documents: serializeDocumentSubform(Clientsval,Caseval) 
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
                const recordDetails = await ZOHO.CREATOR.API.getRecordById({
                    appName: APP_NAME,
                    reportName: "All_Document_Upload_Wizards", 
                    id: documentsRecordId
                });
                console.log(recordDetails);
                const subformRows = recordDetails.data.Documents; 
                
                await uploadAllWizardFiles(subformRows);

                // Run final master sync
                await syncMasterRecord(8, documentsRecordId, true);

                showToast("Documents & Files Saved Successfully!");
                const btn = formSteps[stepIndex].querySelector(".btn-group button:last-child"); 
                btn.innerText = "Update";
                btn.onclick = updateDocumentsDetails; 
                steps[stepIndex].classList.add("completed");
                showSubmitModal('submit');
            } catch (error) {
                console.error("Failed to fetch subform rows or upload files:", error);
                showToast("Text saved, but file uploads failed. Check console.");
            }
        } else {
            console.error("Save Failed:", response.error);
            showToast("Failed to save documents. Fill Mandatory fields");
        }
    });
}

function executeUpdateDocumentsDetails() {
    const stepIndex = 7;
    const Clientsval= formSteps[stepIndex].querySelector("#Clients").value;
    const Caseval= formSteps[stepIndex].querySelector("#Case").value;
    const formData = {
        data: {
            Clients: Clientsval,
            Case: Caseval,
            A_Master: formSteps[stepIndex].querySelector("#A_Master").value,
            Personal_Master: formSteps[stepIndex].querySelector("#Personal_Master").value,
            Entity_Master: formSteps[stepIndex].querySelector("#Entity_Master").value,
            Documents: serializeDocumentSubform(Clientsval,Caseval) 
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
                const recordDetails = await ZOHO.CREATOR.API.getRecordById({
                    appName: APP_NAME,
                    reportName: "All_Document_Upload_Wizards", 
                    id: documentsRecordId
                });
                
                const subformRows = recordDetails.data.Documents; 
                await uploadAllWizardFiles(subformRows);
                
                // Run final master sync
                await syncMasterRecord(8, documentsRecordId, true);

                showToast("Documents & Files Updated Successfully!");
                showSubmitModal('submit');
            } catch (error) {
                console.error("Failed to fetch subform rows or upload files:", error);
                showToast("Text updated, but file uploads failed. Check console.");
            }
        } else {
            console.error("Update Failed:", response.error);
            showToast("Failed to update documents.");
        }
    });
}

async function uploadAllWizardFiles(savedZohoRows) {
    const uiRows = document.querySelectorAll("#customSubformTableDOCS .subform-row");

    for (let i = 0; i < uiRows.length; i++) {
        let uiRowId = uiRows[i].getAttribute("data-ui-row-id");
        let filesToUpload = subformFileTracker[uiRowId];
        
        let zohoSubformRowId = uiRows[i].getAttribute("data-zoho-row-id");
        
        if (!zohoSubformRowId && savedZohoRows[i]) {
            zohoSubformRowId = savedZohoRows[i].ID;
            uiRows[i].setAttribute("data-zoho-row-id", zohoSubformRowId); 
        }

        if (zohoSubformRowId && filesToUpload) {
            if (filesToUpload.typeOne && filesToUpload.typeOne.length > 0) {
                for (let file of filesToUpload.typeOne) {
                    await uploadSingleFile("Document_File", file, zohoSubformRowId);
                }
                filesToUpload.typeOne = null; 
            }
            
            if (filesToUpload.typeTwo && filesToUpload.typeTwo.length > 0) {
                for (let file of filesToUpload.typeTwo) {
                    await uploadSingleFile("Upload_File1", file, zohoSubformRowId);
                }
                filesToUpload.typeTwo = null; 
            }
        }
    }
}

function uploadSingleFile(fieldName, file, subformRowId) {
    return ZOHO.CREATOR.API.uploadFile({
        appName: APP_NAME,
        reportName: "All_Document_Upload_Wizards",
        id: subformRowId, 
        parentId: documentsRecordId,
        fieldName: "Documents." + fieldName,
        file: file
    });
}