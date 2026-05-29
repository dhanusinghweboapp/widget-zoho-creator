let appName = "ashirwad";
let reportName = "Basic_Details_Report";
let isReady = false;

document.addEventListener("DOMContentLoaded", function () {

    ZOHO.CREATOR.init()
    .then(function (data) {

        console.log("INIT DATA:", data);

        if (!data || !data.appName) {
            console.error("❌ Not running inside Zoho Creator widget context");
            return;
        }

        appName = data.appName;
        isReady = true;

        fetchRecords();
    })
    .catch(function (err) {
        console.error("INIT FAILED:", err);
    });
});

// ===============================
// READ
// ===============================
function fetchRecords() {

    if (!isReady) return;

    ZOHO.CREATOR.API.getAllRecords({
        appName: appName,
        reportName: reportName
    }).then(function (response) {

        let records = response.data || [];
        let table = document.getElementById("dataTable");

        table.innerHTML = "";

        records.forEach(rec => {

            let safeData = encodeURIComponent(JSON.stringify(rec));

            table.innerHTML += `
                <tr>
                    <td>${rec.Name || ""}</td>
                    <td>${rec.Email || ""}</td>
                    <td>${rec.Phone || ""}</td>
                    <td>
                        <button onclick="editRecord('${safeData}')">Edit</button>
                        <button onclick="deleteRecord('${rec.ID}')">Delete</button>
                    </td>
                </tr>
            `;
        });

    });
}
// ===============================
// CREATE / UPDATE
// ===============================
function saveRecord() {

    if (!isReady) {
        alert("Widget not ready yet");
        return;
    }

    let id = document.getElementById("record_id").value;

    let payload = {
        appName: appName,
        formName: "Basic_Details",
        data: {
            Name: document.getElementById("name").value,
            Email: document.getElementById("email").value,
            Phone: document.getElementById("phone").value
        }
    };

    if (id) {
        payload.data.ID = id;

        ZOHO.CREATOR.API.updateRecord(payload).then(fetchRecords);

    } else {

        ZOHO.CREATOR.API.addRecord(payload).then(fetchRecords);
    }
}

// ===============================
// EDIT
// ===============================
function editRecord(encodedRec) {

    let rec = JSON.parse(decodeURIComponent(encodedRec));

    document.getElementById("record_id").value = rec.ID;
    document.getElementById("name").value = rec.Name || "";
    document.getElementById("email").value = rec.Email || "";
    document.getElementById("phone").value = rec.Phone || "";
}

// ===============================
// DELETE
// ===============================
function deleteRecord(id) {

    if (!confirm("Are you sure?")) return;

    ZOHO.CREATOR.API.deleteRecord({
        appName: appName,
        reportName: reportName,
        criteria: `(ID=="${id}")`
    }).then(function () {
        fetchRecords();
    });
}

// ===============================
// RESET
// ===============================
function resetForm() {
    document.getElementById("record_id").value = "";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
}