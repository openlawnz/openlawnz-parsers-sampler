## openlawnz-parser-tester    


#### Steps to run:



**1. Clone the repo into your local system**
    git clone https://github.com/openlawnz/openlawnz-parsers-sampler.git  


**2. Change into the project directory**
    cd openlawnz-parsers-sampler   


**3. Initialize the openlawnz-parsers submodule**
    git submodule init  
    git submodule update  


**4. Rename the .env.dev to .env and update credentials**

**5. Install dependencies**
    npm install 

**6. Build and run the project**
    npm run all  
 

**Notes**
- Select the number of cases to download between 1 and 500  
- Select a parser to be run against those cases (currently only Representation parser implemented)  
- The downloaded caseTexts are stored in caseTexts directory in the root of the project  
- The CSV file is saved  in the csvOutput directory in the root of the project   
- To re-run without building the project execute :  
    npm run start  
- To reduce console output, change the value of ENV variable in .env file to anything other than DEVELOPMENT  