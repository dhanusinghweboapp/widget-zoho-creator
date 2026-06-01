const APP_NAME = "ashirwad";

let currentStep = 1;







const formSteps = document.querySelectorAll(".form-step");
const steps = document.querySelectorAll(".step");


// ======================================
// RECORD IDS
// ======================================

let basicRecordId = null;
let educationRecordId = null;


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

        if(basicRecordId){

            showStep(2);

        }
        else{

            alert("Please complete Basic Details first");

        }

    }

    // STEP 3

    else if(step == 3){

        if(educationRecordId){

            showStep(3);

        }
        else{

            alert("Please complete Education Details first");

        }

    }

    // STEP 4

    else if(step == 4){

        if(documentRecordId){

            showStep(4);

        }
        else{

            alert("Please upload documents first");

        }

    }

}

// ======================================
// BACK BUTTON
// ======================================

function prevStep(step){

    showStep(step);

    // BACK TO BASIC DETAILS

    if(step == 1){

        getBasicRecord();

    }

}


// ======================================
// SAVE BASIC DETAILS
// ======================================

function saveBasicDetails(){

    const name = document.getElementById("name").value;

    const role = document.getElementById("role").value;

    const phone = document.getElementById("phone").value;



    // VALIDATION

    if(name == "" || role == "" || phone == ""){

        alert("Please fill all fields");

        return;

    }



    const formData = {

        data:{

            Name:name,

            Roll:role,

            Phone_no:phone

        }

    };



    // CREATE RECORD

    ZOHO.CREATOR.API.addRecord({

        appName:APP_NAME,

        formName:"Basic_Details",

        data:formData

    }).then(function(response){

        console.log(response);

        if(response.code == 3000){

            alert("Basic Details Saved");



            // SAVE RECORD ID

            basicRecordId = response.data.ID;



            console.log("Basic Record ID :", basicRecordId);



            // CHANGE BUTTON

            document.getElementById("basicBtn").innerText =
            "Update & Next";



            // CHANGE BUTTON FUNCTION

            document.getElementById("basicBtn").onclick =
            updateBasicDetails;



            // COMPLETE STEP

            steps[0].classList.add("completed");



            // NEXT STEP

            showStep(2);

        }

    });

}


// ======================================
// GET BASIC RECORD
// ======================================

function getBasicRecord(){

    if(!basicRecordId){

        return;

    }

    ZOHO.CREATOR.API.getRecordById({

        appName:APP_NAME,

        reportName:"Basic_Details_Report",

        id:basicRecordId

    }).then(function(response){

        console.log(response);

        if(response.code == 3000){

            // FILL INPUTS

            document.getElementById("name").value =
            response.data.Name || "";

            document.getElementById("role").value =
            response.data.Roll || "";

            document.getElementById("phone").value =
            response.data.Phone_no || "";



            // BUTTON TEXT

            document.getElementById("basicBtn").innerText =
            "Update & Next";



            // BUTTON FUNCTION

            document.getElementById("basicBtn").onclick =
            updateBasicDetails;

        }

    });

}


// ======================================
// UPDATE BASIC DETAILS
// ======================================

function updateBasicDetails(){

    const name = document.getElementById("name").value;

    const role = document.getElementById("role").value;

    const phone = document.getElementById("phone").value;



    if(name == "" || role == "" || phone == ""){

        alert("Please fill all fields");

        return;

    }



    const formData = {

        data:{

            Name:name,

            Roll:role,

            Phone_no:phone

        }

    };



    ZOHO.CREATOR.API.updateRecord({

        appName:APP_NAME,

        reportName:"Basic_Details_Report",

        id:basicRecordId,

        data:formData

    }).then(function(response){

        console.log(response);

        if(response.code == 3000){

            alert("Basic Details Updated");

            showStep(2);

        }

    });

}



// ======================================
// SAVE EDUCATION DETAILS
// ======================================

function saveEducationDetails(){

    const college = document.getElementById("college").value;

    const degree = document.getElementById("degree").value;

    const year = document.getElementById("year").value;



    // VALIDATION

    if(college == "" || degree == "" || year == ""){

        alert("Please fill all fields");

        return;

    }



    const formData = {

        data:{

            Collage_Name:college,

            Degree:degree,

            Passing_Year:year

        }

    };



    // CREATE RECORD

    ZOHO.CREATOR.API.addRecord({

        appName:APP_NAME,

        formName:"Education_Details",

        data:formData

    }).then(function(response){

        console.log(response);

        if(response.code == 3000){

            alert("Education Details Saved");



            // SAVE RECORD ID

            educationRecordId = response.data.ID;



            // CHANGE BUTTON TEXT

            document.getElementById("educationBtn").innerText =
            "Update & Next";



            // CHANGE BUTTON FUNCTION

            document.getElementById("educationBtn").onclick =
            updateEducationDetails;



            // COMPLETE STEP

            steps[1].classList.add("completed");



            // OPEN STEP 3

            showStep(3);

        }

    });

}



// ======================================
// GET EDUCATION RECORD
// ======================================

function getEducationRecord(){

    if(!educationRecordId){

        return;

    }

    ZOHO.CREATOR.API.getRecordById({

        appName:APP_NAME,

        reportName:"Education_Details_Report",

        id:educationRecordId

    }).then(function(response){

        console.log(response);

        if(response.code == 3000){

            // FILL INPUTS

            document.getElementById("college").value =
            response.data.Collage_Name || "";

            document.getElementById("degree").value =
            response.data.Degree || "";

            document.getElementById("year").value =
            response.data.Passing_Year || "";



            // BUTTON TEXT

            document.getElementById("educationBtn").innerText =
            "Update";



            // BUTTON FUNCTION

            document.getElementById("educationBtn").onclick =
            updateEducationDetails;

        }

    });

}





// ======================================
// UPDATE EDUCATION DETAILS
// ======================================
function updateEducationDetails(){

    const college = document.getElementById("college").value;

    const degree = document.getElementById("degree").value;

    const year = document.getElementById("year").value;



    if(college == "" || degree == "" || year == ""){

        alert("Please fill all fields");

        return;

    }



    const formData = {

        data:{

            Collage_Name:college,

            Degree:degree,

            Passing_Year:year

        }

    };



    ZOHO.CREATOR.API.updateRecord({

        appName:APP_NAME,

        reportName:"Education_Details_Report",

        id:educationRecordId,

        data:formData

    }).then(function(response){

        console.log(response);

        if(response.code == 3000){

            alert("Education Details Updated");



            // OPEN STEP 3

            showStep(3);

        }

    });

}































// =====================================
// DOCUMENT RECORD ID
// =====================================

let documentRecordId = null;


// =====================================
// FILE ARRAYS
// =====================================

let resumeFiles = [];

let tenthFiles = [];

let twelfthFiles = [];


// =====================================
// HANDLE FILES
// =====================================

function handleFiles(event,type){

    const files = Array.from(event.target.files);

    // RESUME

    if(type == "resume"){

        resumeFiles.push(...files);

        renderFiles(
            resumeFiles,
            "resumePreview",
            "resume"
        );

    }

    // 10TH

    if(type == "tenth"){

        tenthFiles.push(...files);

        renderFiles(
            tenthFiles,
            "tenthPreview",
            "tenth"
        );

    }

    // 12TH

    if(type == "twelfth"){

        twelfthFiles.push(...files);

        renderFiles(
            twelfthFiles,
            "twelfthPreview",
            "twelfth"
        );

    }

    event.target.value = "";

}


// =====================================
// RENDER FILES
// =====================================

function renderFiles(files,previewId,type){

    const preview =
    document.getElementById(previewId);

    preview.innerHTML = "";

    files.forEach((file,index)=>{

        preview.innerHTML += `

            <div class="file-item">

                <span>${file.name}</span>

                <button class="remove-btn"
                onclick="removeFile('${type}',${index})">

                    Remove

                </button>

            </div>

        `;

    });

}


// =====================================
// REMOVE FILE
// =====================================

function removeFile(type,index){

    if(type == "resume"){

        resumeFiles.splice(index,1);

        renderFiles(
            resumeFiles,
            "resumePreview",
            "resume"
        );

    }

    if(type == "tenth"){

        tenthFiles.splice(index,1);

        renderFiles(
            tenthFiles,
            "tenthPreview",
            "tenth"
        );

    }

    if(type == "twelfth"){

        twelfthFiles.splice(index,1);

        renderFiles(
            twelfthFiles,
            "twelfthPreview",
            "twelfth"
        );

    }

}


// =====================================
// SAVE DOCUMENTS
// =====================================

function saveDocuments(){

    // FIRST TIME CREATE

    if(!documentRecordId){

        ZOHO.CREATOR.API.addRecord({

            appName:APP_NAME,

            formName:"Documents_Upload",

            data:{
                data:{}
            }

        }).then(function(response){

            console.log(response);

            if(response.code == 3000){

                // SAVE RECORD ID

                documentRecordId =
                response.data.ID;

                console.log(
                    "Document Record ID : ",
                    documentRecordId
                );



                // UPLOAD FILES

                uploadAllFiles();



                // CHANGE BUTTON

                document.getElementById("documentBtn").innerText =
                "Update Documents";



                // CHANGE FUNCTION

                document.getElementById("documentBtn").onclick =
                updateDocuments;



                // COMPLETE STEP

                steps[2].classList.add("completed");



                // OPEN STEP 4

                showStep(4);

            }

        });

    }

    // UPDATE EXISTING RECORD

    else{

        uploadAllFiles();



        // OPEN STEP 4

        showStep(4);

    }

}



// =====================================
// UPLOAD ALL FILES
// =====================================

async function uploadAllFiles(){

    // =====================================
    // CLEAR OLD FILES FIRST
    // =====================================

    await clearFieldFiles("Upload_Resume");

    await clearFieldFiles("Upload_10th_Marksheet");

    await clearFieldFiles("Upload_12th_Marksheet");



    // =====================================
    // UPLOAD RESUME FILES
    // =====================================

    for(let file of resumeFiles){

        await uploadSingleFile(
            "Upload_Resume",
            file
        );

    }



    // =====================================
    // UPLOAD 10TH FILES
    // =====================================

    for(let file of tenthFiles){

        await uploadSingleFile(
            "Upload_10th_Marksheet",
            file
        );

    }



    // =====================================
    // UPLOAD 12TH FILES
    // =====================================

    for(let file of twelfthFiles){

        await uploadSingleFile(
            "Upload_12th_Marksheet",
            file
        );

    }



   openFinalStep();

}


// =====================================
// SINGLE FILE UPLOAD
// =====================================

function uploadSingleFile(fieldName,file){

    return ZOHO.CREATOR.API.uploadFile({

        appName : APP_NAME,

        reportName :
        "Documents_Upload_Report",

        id : documentRecordId,

        fieldName : fieldName,

        file : file

    });

}










// =====================================
// CLEAR FIELD FILES
// =====================================

function clearFieldFiles(fieldName){

    let emptyData = {

        data:{}

    };

    emptyData.data[fieldName] = [];

    return ZOHO.CREATOR.API.updateRecord({

        appName:APP_NAME,

        reportName:"Documents_Upload_Report",

        id:documentRecordId,

        data:emptyData

    });

}






// =====================================
// OPEN STEP 4 AFTER DOCUMENTS
// =====================================

function openFinalStep(){

    steps[2].classList.add("completed");

    showStep(4);

}






// =====================================
// BACK TO DOCUMENT STEP
// =====================================

function goBackToDocuments(){

    showStep(3);

}


// =====================================
// FINAL SUBMIT
// =====================================

function finalSubmit(){

    alert("Application Submitted Successfully");

}