import * as fs from 'fs'

import parseRepresentation from '../openlawnz-parsers/src/parseRepresentation'
// import parseCourtFilingNumber from '../openlawnz-parsers/src/parseCourtFilingNumber'
// import parseLocation from '../openlawnz-parsers/src/parseLocation'
// import judgeTitles from '../openlawnz-parsers/src/dataDefinitions/judgeTitles.json';
// import parseJudges from '../openlawnz-parsers/src/parseJudges';


const inquirer = require('./lib/inquirer')
const createCSVWriter = require('csv-writer').createObjectCsvWriter; 


// Since this is a cli-only tool, no need to use connection pool
const { Client } = require('pg')

// some helper modules
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const {v4: uuidv4} = require('uuid')

// environment variables
require('dotenv').config()

const client = new Client ({
    user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
    
});

// check whether running in development mode
const env = process.env.ENV

let paint = () =>{
    console.log(
        chalk.yellowBright(
            figlet.textSync('Openlaw NZ', {horizontalLayout : 'full'})
        )
    )
}

(async () => {

    clear()
    paint();

    const inputs =  await inquirer.ask()    
    
    let n_cases = inputs.n_cases
    let parser  = inputs.parser.toLowerCase() 

    if ( parseInt(n_cases, 10) == n_cases && parseInt(n_cases) <= 500){
        console.log(`Input correct - Fetching cases for parser - ${parser}`)
    }
    else{
        console.log(`Invalid number of cases. Try again`)
        return
    }

    clear()
    paint()

    console.log(uuidv4())
    console.log("Fetching case data from database...................")

    if(env === "DEVELOPMENT"){        
        console.time("DB Connect")    
    }
    await client.connect()

    if(env === "DEVELOPMENT"){
        console.timeEnd("DB Connect")
        console.time("DB Retrieve")
    }

    /* Both queries are very similar and barely any performance difference */
    // const res = await client.query(`SELECT * FROM main.cases order by random() limit ${n_cases}`)
    const res = await client.query(`select * from main.cases TABLESAMPLE SYSTEM_ROWS(${n_cases})`)
    
    if(env === "DEVELOPMENT"){
        console.timeEnd("DB Retrieve")
        console.time("Write Cases")
    }

    let caseFiles = []
    let caseTextsDir = 'caseTexts'
    let csvOutDir='csvOutput'

    try{
        if(!fs.existsSync(caseTextsDir)){
            fs.mkdirSync(caseTextsDir);
        }
        if(!fs.existsSync(csvOutDir)){
            fs.mkdirSync(csvOutDir);
        }
    }catch(err){
        console.log("Error creating output directory")
        return 
    }

    if(res && res.rows.length > 0){        
        for (let row of res.rows){
            let case_id = row.id
            /*
            let caseData = {
                "id" : row.id,
                "case_name" : row.case_name,
                "case_date": row.case_date, 
                "is_valid": row.is_valid, 
                "pdf_id" : row.pdf_id,
                "court_id": row.court_id, 
                "lawreport_id": row.lawreport_id, 
                "location" : row.location,
                "conversion_engine": row.conversion_engine,
                "court_filing_number": row.court_filing_number,
                "last_modified": row.last_modified,
                "parsers_version": row.parsers_version,
                "case_text": row.case_text
            }
            */
            let caseData = {...row}

            const data = JSON.stringify(caseData)
            fs.writeFileSync(`${caseTextsDir}/${case_id}.json`, data)            
            // fs.writeFileSync(`${caseTextsDir}/${case_id}.txt`, case_text)            
            // caseFiles.push(`${case_id}.txt`)            
            caseFiles.push(`${case_id}.json`)            
            if(env === "DEVELOPMENT"){
                console.log(`File written ${case_id}.txt successfully.`)
            }
        }
    }

    console.log(`Case text files written successfully to caseTexts directory.`)

    if(env === "DEVELOPMENT"){        
        console.timeEnd("Write Cases")
    }

    await client.end()

    // Parsers to integrate
    // "Representation", "Legislation", "Case Citations", "Category", "Court", "CourtFiling", "Judges", "Law Report", "Location"
    // Parser header will change for each parser. @will will decide the output format and based on that will need to update the code
    const csvWriter = createCSVWriter({
        path:`${csvOutDir}/out.csv`, 
        header:[
            {id: 'caseid', title:'Case ID'}, 
            {id: 'result_object', title:'Result object'}, 
            // {id: 'case_object', title:'Case object'}
        ]
    })  
    
    // array of objects to store parser output data
    let csvData = []
    for (let i=0; i< caseFiles.length; i++){
        
        if(env === "DEVELOPMENT"){
            console.log(caseFiles[i])
        }

        // Reading the case texts from local directory ${caseTextsDir}
        const caseTextData = fs.readFileSync(`${caseTextsDir}/${caseFiles[i]}`).toString()                
        const caseText = JSON.parse(caseTextData).case_text
        let result; 
        
        switch(parser){
            case 'representation':                
                result = parseRepresentation(caseText)
                // const { initiation, response } = result        
                csvData.push({
                    caseid: caseFiles[i],
                    result_object: JSON.stringify(result), 
                    // case_object: caseText
                })                
                break
            
            case 'legislation':
                console.log("Implementation pending")
                break
            
            case 'case citations':
                console.log("Implementation pending")
                break       
            
            case 'category':                
                console.log("Implementation pending")
                break       
                
            case 'court':                
                console.log("Implementation pending")
                break
            
            case 'courtfiling':   
                console.log("Implementation pending")
                // result = parseCourtFilingNumber(caseText)            
                // console.log(result)
                break

            case 'judges':                
                console.log("Implementation pending")
                // result = parseJudges({ judgeTitles, fileKey: caseFiles[i], caseText: caseText });
                // console.log(result)
                break
        
            case 'law report':
                console.log("Implementation pending")                
                break

            case 'location':
                console.log("Implementation pending")
                // result = parseLocation(caseText);
                // console.log(result)
                break
        }

    }

    csvWriter.writeRecords(csvData)
    console.log(`Csv results saved to ${csvOutDir} directory`)
     
})()