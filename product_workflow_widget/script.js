// Product Workflow Widget Script
// Defines the workflow stages and fetches related records

const STAGES = [
  {
    name: "Purchase initiation",
    checklist: ["Invoice", "CE Certificate", "Service history"]
  },
  {
    name: "Purchase registration",
    checklist: ["JRT#", "Payment process initiation"]
  },
  {
    name: "Transport in setup",
    checklist: ["Transport Type", "Customs docs ready"]
  },
  {
    name: "Arrival of the machine",
    checklist: ["CMR", "Exact dimensions", "Intervention form complete"]
  },
  {
    name: "Machine prep",
    checklist: ["Quotation", "Cost added on Zoho", "Estimated time of completion"]
  },
  {
    name: "Sales prep",
    checklist: ["Follow order", "Teaser", "Machine prep complete", "Photos + Videos", "Mascus Upload"]
  },
  {
    name: "Sales registration",
    checklist: ["Zoho Deal Created", "Proforma sent to client"]
  },
  {
    name: "Sales follow-up",
    checklist: ["Payment Made", "Ready for transport out"]
  },
  {
    name: "Transport out setup",
    checklist: ["Transport Type", "Shipping Mode", "All the relevant docs ready", "Photo out"]
  }
];

// Initialize the embedded app
ZOHO.embeddedApp.on("PageLoad", function(data) {
  const productId = data.EntityId;
  loadWorkflow(productId);
});

ZOHO.embeddedApp.init();

function loadWorkflow(productId) {
  ZOHO.CRM.API.getRelatedRecords({
    Entity: "Products",
    RecordID: productId,
    RelatedList: "Product_Workflow" // API name of custom module
  }).then(function(response) {
    let records = response.data || [];
    buildUI(records);
  }).catch(function() {
    buildUI([]); // build empty UI if API fails
  });
}

function buildUI(records) {
  const stageDiv = document.getElementById("stages");
  const progressDiv = document.getElementById("progress");
  progressDiv.innerHTML = '<div id="progress-bar"></div>';
  stageDiv.innerHTML = "";

  let completeCount = 0;

  STAGES.forEach(stage => {
    const record = records.find(r => r.Stage === stage.name) || {};
    const stageEl = document.createElement("div");
    stageEl.className = "stage";
    const title = document.createElement("div");
    title.className = "stage-title";
    title.textContent = stage.name;

    const checklistUl = document.createElement("ul");
    checklistUl.className = "checklist";

    let allDone = true;

    stage.checklist.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      let done = false;

      if (record) {
        // dropdown fields
        if (item === "Transport Type" && record["Transport_Type"]) done = true;
        else if (item === "Shipping Mode" && record["Shipping_Mode"]) done = true;
        else if (record["Checklist"] && record["Checklist"].includes(item)) done = true;
      }

      if (done) li.classList.add("done");
      if (!done) allDone = false;
      checklistUl.appendChild(li);
    });

    if (allDone) {
      stageEl.classList.add("completed");
      completeCount++;
    }

    stageEl.appendChild(title);
    stageEl.appendChild(checklistUl);
    stageDiv.appendChild(stageEl);
  });

  const bar = document.getElementById("progress-bar");
  const percent = Math.round((completeCount / STAGES.length) * 100);
  bar.style.width = percent + "%";
}
