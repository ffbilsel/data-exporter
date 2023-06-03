import { Button, Input, Select, Tag } from "antd";
import { useRef, useState } from "react";

//AIzaSyCxRcjjWMEaLR1bBMmYDMFK_GGaOuXZa34

const inputDataOptions = [
  {
    value: "CSV",
    label: "CSV",
  },
  {
    value: "EXCEL",
    label: "Excel",
  },
  {
    value: "G_SHEETS",
    label: "Google Sheets",
  },
];

const outputDataOptions = [
  {
    value: "CSV",
    label: "CSV",
  },
  {
    value: "EXCEL",
    label: "Excel",
  },
  {
    value: "XML",
    label: "XML",
  },
  {
    value: "JSON",
    label: "JSON",
  },
];

const colorList = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

const allowedTypes = ["INT", "STR", "CHAR", "DATETIME", "DATE"];

function App() {
  const [inputSelection, setInputSelection] = useState("");
  const [outputSelection, setOutputSelection] = useState("");
  const [inHeaderTags, setInHeaderTags] = useState([]);
  const [outHeaderTags, setOutHeaderTags] = useState([]);
  const [inTextAreaText, setInTextAreaText] = useState("");
  const [outTextAreaText, setOutTextAreaText] = useState("");
  const sheetId = useRef("");
  const sheetName = useRef("");
  const file = useRef(null);

  async function exportData() {
    const data = {
      inType: inputSelection,
      outType: outputSelection,
      header: inHeaderTags,
      outHeader: outHeaderTags,
    };

    if (inputSelection === "G_SHEETS") {
      const SHEET_ID = sheetId.current;
      const SHEET_NAME = sheetName.current;
      const API_KEY = "AIzaSyCxRcjjWMEaLR1bBMmYDMFK_GGaOuXZa34";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?valueRenderOption=FORMATTED_VALUE&key=${API_KEY}`;

      fetch(url, { method: "GET" })
        .then((response) => response.json())
        .then((json) => (data.data = json.values))
        .then(() => {
          fetch("http://localhost:8085/export/sheets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }).then(async (response) => {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(
              new Blob([blob], { type: "application/octet-stream" })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              "result." +
                (outputSelection === "EXCEL"
                  ? "xlsx"
                  : outputSelection.toLowerCase())
            );
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
          });
        });
    }

    if (inputSelection === "CSV" || inputSelection === "EXCEL") {
      let formData = new FormData();
      formData.append("file", file.current);
      formData.append(
        "inData",
        new Blob([JSON.stringify(data)], {
          type: "application/json",
        })
      );
      fetch("http://localhost:8085/export", {
        method: "POST",
        body: formData,
      }).then(async (response) => {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(
          new Blob([blob], { type: "application/octet-stream" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "result." +
            (outputSelection === "EXCEL"
              ? "xlsx"
              : outputSelection.toLowerCase())
        );
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
      });
    }
  }

  return (
    <div
      style={{
        margin: "3rem auto",
        width: "fit-content",
        padding: "3rem",
        border: "1px solid black",
        borderRadius: "8px",
        backgroundColor: "whitesmoke",
      }}
    >
      <div>
        <Select
          style={{ width: "40rem" }}
          options={inputDataOptions}
          onChange={(value) => {
            setInputSelection(value);
            setInHeaderTags([]);
          }}
        />
        <div style={{ marginBottom: "1rem" }}>
          <p>
            Allowed data types are{" "}
            {allowedTypes.reduce((accum, val) => accum + " " + val)}.
          </p>
          {inHeaderTags.map((val, index) => (
            <Tag
              key={"inHeader" + index}
              color={colorList[index % colorList.length]}
            >
              {val.name}
            </Tag>
          ))}
        </div>
        <div>
          <Input
            style={{
              width: "40rem",
            }}
            placeholder="Input Header => headerName:dataType;"
            value={inTextAreaText}
            onChange={(event) => {
              const text = event.target.value;

              if (text.charAt(text.length - 1) === ";") {
                let name = text.substring(0, text.indexOf(":"));
                let type = text.substring(
                  text.indexOf(":") + 1,
                  text.length - 1
                );
                console.log(type);
                setInTextAreaText("");
                if (!allowedTypes.includes(type)) {
                  console.log("Data type is not allowed.");
                  return;
                }

                setInHeaderTags([...inHeaderTags, { name: name, type: type }]);
              } else {
                setInTextAreaText(text);
              }
            }}
          />
        </div>
      </div>

      <Input
        type="file"
        style={{
          display:
            inputSelection === "CSV" || inputSelection === "EXCEL"
              ? "block"
              : "none",
          marginTop: "1rem",
        }}
        onChange={(event) => {
          file.current = event.target.files[0];
        }}
      />

      <div
        style={{
          display: inputSelection === "G_SHEETS" ? "inline-block" : "none",
        }}
      >
        <Input
          style={{ width: "40rem", margin: "1rem 0", display: "block" }}
          placeholder="Sheet ID;"
          onChange={(event) => {
            const text = event.target.value;

            if (text.charAt(text.length - 1) === ";") {
              sheetId.current = text.substring(0, text.length - 1);
            }
          }}
        />

        <Input
          style={{ width: "40rem" }}
          placeholder="Sheet Name;"
          onChange={(event) => {
            const text = event.target.value;

            if (text.charAt(text.length - 1) === ";") {
              sheetName.current = text.substring(0, text.length - 1);
            }
          }}
        />
      </div>

      <div style={{ margin: "3rem 0" }}>
        <Select
          style={{ width: "40rem" }}
          options={outputDataOptions}
          onChange={(value) => {
            setOutputSelection(value);
            setOutHeaderTags([]);
          }}
        />
        <div style={{ marginBottom: "1rem" }}>
          <p>
            Allowed data types are{" "}
            {allowedTypes.reduce((accum, val) => accum + " " + val)}.
          </p>
          {outHeaderTags.map((val, index) => (
            <Tag
              key={"outHeader" + index}
              color={colorList[index % colorList.length]}
            >
              {val.name}
            </Tag>
          ))}
        </div>
        <Input
          placeholder="Output Header => headerName:dataType:string functions and in header variable;"
          style={{ width: "40rem" }}
          value={outTextAreaText}
          onChange={(event) => {
            let text = event.target.value;

            if (text.charAt(text.length - 1) === ";") {
              let name = text.substring(0, text.indexOf(":"));
              text = text.substring(text.indexOf(":") + 1);
              let type = text.substring(0, text.indexOf(":"));
              setOutTextAreaText("");

              if (!allowedTypes.includes(type)) {
                console.log("Data type is not allowed.");
                return;
              }

              let script = text.substring(
                text.indexOf(":") + 1,
                text.length - 1
              );
              // TODO control script

              setOutHeaderTags([
                ...outHeaderTags,
                { name: name, type: type, script: script },
              ]);
            } else {
              setOutTextAreaText(text);
            }
          }}
        />
      </div>

      <Button style={{ display: "block" }} type="primary" onClick={exportData}>
        Create Output
      </Button>
      {/* input type can be CSV, EXCEL, google sheets, API, web SCRAPE, DATABASE 
      middle ground should be output format definition 
      output can be CSV, EXCEL, google sheets or a DATABASE */}
      {/* automatic typo detection, data type corrections, remove duplicates */}
      {/* create statistics about data */}
      {/* DON'T KNOW ABOUT THIS. Customizable Reporting Templates: Emphasize the ability of your solution to provide customizable reporting templates.
      Users can define report structures, set formatting preferences, and automate the generation of reports based on imported data. */}
      {/* Automated Data Refresh: Showcase how your script can automate data refresh and update processes. Users can set schedules or triggers to regularly 
      import and update data, ensuring that the spreadsheet reflects the most up-to-date information without manual intervention. */}
      {/* Collaboration and Sharing: Illustrate how your solution supports collaboration and sharing capabilities. Multiple users can access and work on the 
      same spreadsheet simultaneously, making it easy to collaborate on data analysis or reporting tasks. Users can also control access rights and permissions 
      to maintain data security.

      Integration with External Tools: Highlight the feature of integrating with external tools or services. Your script can connect to other software or APIs to fetch 
      additional data, perform advanced analysis using specialized tools, or export data to external systems for further processing. */}
      {/* Google Workspace Marketplace */}
    </div>
  );
}

export default App;
