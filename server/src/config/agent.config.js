// import {promises as fs} from 'fs';
// import path from 'path';
// import chalk from 'chalk';
// import { generateObject } from 'ai';
// import {describe, success, z} from 'zod';
// import { AIService } from '../cli/ai/googel-service';
//  const ApplicationSchema=z.object({
//     folderName:z.string().describe("Kebab-Case folder name for the application"),
//     description:z.string().describe("Brief description of what was created"),
//     files:z.array(
//         z.object({
//             path:z.string().describe("Realtive file path(e.g src/index.js"),
//             content:z.string().describe("complete file content")
//         }).describe("All files needed for the application")
//     ),
//     setupCommands:z.array(
//         z.string().describe("Bash Command to setUp and run (e.g npm i, npm run dev")
//     ),
//     dependencies:z.record(z.string()).optional().describe("Npm dependencies with version")
//  })

//  function printSystem(message){
//     console.log(message);

//  }

//  function displayFileTree(files,folderName){
//   printSystem(chalk.cyan('/n Project Structure'));
//   printSystem(chalk.white(`{${folderName}/`));
//   const filesByDir={};
//   files.forEach(file => {
//     const parts=file.path.split('/');
//     const dir=parts.length>1 ? parts.slice(0,-1).join('/'):'';
//     if(!filesByDir[dir]){
//         filesByDir[dir]=[];
//     }
//     filesByDir[dir].push(parts[parts.length-1]);
//   });
//   Object.keys(filesByDir).sort().forEach(dir=>{
//     if(dir){
//         printSystem(chalk.white(`|-- ${dir}`));
//         filesByDir[dir].forEach(file=>{
//             printSystem(chalk.white(`|.   |__${file}`));
//         })
//     }
//     else{
//         filesByDir[dir].forEach(file =>{
//             printSystem(chalk.white(`|--${file}`));
//         })
//     }
//   })
//  }


//  async function createApplicationFiles(baseDir,folderName,files){
//    const appDir=path.join(baseDir,folderName);
//    await fs.mkdir(appDir,{recursive:true});
//    printSystem(chalk.cyan(`\n Created directory:  ${folderName}/`));
//    for(const file of files){
//       const filePath=path.join(appDir,filePath);
//       const fileDir=path.dirname(filePath);


//       await fs.mkdir(fileDir,{recursive: true});
//       await fs.writeFile(filePath,file.content,'utf-8');
//       printSystem(chalk.green(`. ${file.path}`))
//    }
//    return appDir;
//  }
//  export async function generateApplication ( description,aiService,cwd=process.cwd()){
//     try{
//   printSystem(chalk.cyan('\n Agent mode: Generating your Apllication...\n'));
//   printSystem(chalk.gray(`Request: ${description}`));
//   printSystem(chalk.magenta('Agent Response"\n'));
//   const {object:application}=await generateObject({
//     model:aiService.model,
//     schema:ApplicationSchema,
//     prompt:`
    
//     You are an expert full-stack architect, DevOps engineer, and senior software engineer.  
// Generate a complete, production-ready application for: ${description}

// I want you to produce all files exactly as a real working project would have them.  
// For every file, output the full path and full code.

// When generating the application, follow these rules:

// 1. CODE QUALITY  
//    - Use clean, maintainable, scalable architecture.  
//    - Use industry best practices for backend, frontend, and infrastructure.  
//    - Write fully functional production-ready code—no placeholders.  
//    - Add comments where needed.

// 2. FOLDER STRUCTURE  
//    - Include a complete folder structure for the entire project.  
//    - Include frontend, backend, config files, Dockerfiles, CI/CD, tests, and environment examples.

// 3. BACKEND REQUIREMENTS  
//    - Proper routing, controllers, services, models.  
//    - Environment variable support (.env.example).  
//    - JWT or OAuth authentication (if needed).  
//    - Database integration (MongoDB/Postgres/MySQL).  
//    - Include schema files and migration setup.

// 4. FRONTEND REQUIREMENTS  
//    - Modern UI with reusable components.  
//    - Use Tailwind CSS or specified UI framework.  
//    - Include API service files and state management (if needed).

// 5. DEPLOYMENT & DEVOPS  
//    - Provide Dockerfile + docker-compose for local + production.  
//    - Provide CI/CD workflow (GitHub Actions).  
//    - Provide cloud deployment setup (AWS, DigitalOcean, Render, or Vercel).  
//    - Include instructions to run, build, deploy.

// 6. DOCUMENTATION  
//    - Include README.md with setup steps, commands, and deployment instructions.  
//    - Include notes about environment variables, secrets, and project architecture.

// 7. SECURITY & PERFORMANCE  
//    - Use secure headers, input validation, sanitization.  
//    - Use best practices for API security, CORS, rate limiting if required.  
//    - Optimize builds for production.

// After following all rules above:

// 👉 Generate the full application for the following idea:  
// [INSERT YOUR APP IDEA HERE]
//     `
//   })
//   printSystem(chalk.green(`\n Generated: ${application.folderName}\n`));
//   printSystem(chalk.gray(`description: ${application.description}\n`));
//   if(application.files.length===0){
//    throw new Error('No files generated');
//   }
//   displayFileTree(application.files,application.folderName);

//   printSystem(chalk.cyan('\n Creting files....\n'));
//   const appDir=await createApplicationFiles(
//    cwd,
//    application.folderName,
//    application.files
//   );
//   printSystem(chalk.green.bold(`\n Application created Successfully \n`));
//    printSystem(chalk.cyan(`\n Location:    ${chalk.bold(appDir)} \n`));
//    if(application.setupCommands.length>0){
//       printSystem(chalk.cyan('Next steps:\n'));
//       printSystem(chalk.white('````bash'));
//       application.setupCommands.forEach((cmd)=>{
//          printSystem(chalk.white(cmd));
//       });
//       printSystem(chalk.white("```\n"));
//    }
//    return {
//       folderName:application.folderName,
//       appDir,
//       files:application.files.map(f=>f.path),
//       commands:application.setupCommands,
//       success:true
//    }
//     }
//     catch(e){
//    printSystem(chalk.red(`\n Error in generating Application:   ${e.message}`));
//    if(e.stack){
//       printSystem(chalk.dim(error.stack+'\n'));
//    }
//     }
//  }









import {promises as fs} from 'fs';
import path from 'path';
import chalk from 'chalk';
import { generateObject } from 'ai';
import { z } from 'zod'; // MINOR: Changed import

const ApplicationSchema=z.object({
    folderName:z.string().describe("Kebab-Case folder name for the application"),
    description:z.string().describe("Brief description of what was created"),
    files:z.array(
        z.object({
            path:z.string().describe("Relative file path (e.g src/index.js)"), // MINOR: Fixed spelling
            content:z.string().describe("Complete file content")
        }).describe("All files needed for the application")
    ),
    setupCommands:z.array(
        z.string().describe("Bash Command to setup and run (e.g npm i, npm run dev)") // MINOR: Fixed "setUp" to "setup"
    ),
    dependencies:z.array(z.string()).optional().describe("Npm dependencies") // MAJOR FIX: Changed from z.record(z.string()) to z.array(z.string())
})

function printSystem(message){
    console.log(message);
}

function displayFileTree(files,folderName){
  printSystem(chalk.cyan('\n Project Structure')); // MINOR: Fixed '/n' to '\n'
  printSystem(chalk.white(`${folderName}/`)); // MINOR: Removed extra '{'
  const filesByDir={};
  files.forEach(file => {
    const parts=file.path.split('/');
    const dir=parts.length>1 ? parts.slice(0,-1).join('/'):'';
    if(!filesByDir[dir]){
        filesByDir[dir]=[];
    }
    filesByDir[dir].push(parts[parts.length-1]);
  });
  Object.keys(filesByDir).sort().forEach(dir=>{
    if(dir){
        printSystem(chalk.white(`|-- ${dir}`));
        filesByDir[dir].forEach(file=>{
            printSystem(chalk.white(`|   |__${file}`)); // MINOR: Removed extra '.'
        })
    }
    else{
        filesByDir[dir].forEach(file =>{
            printSystem(chalk.white(`|--${file}`));
        })
    }
  })
}

async function createApplicationFiles(baseDir,folderName,files){
   const appDir=path.join(baseDir,folderName);
   await fs.mkdir(appDir,{recursive:true});
   printSystem(chalk.cyan(`\n Created directory:  ${folderName}/`));
   for(const file of files){
      const filePath=path.join(appDir,file.path); // MINOR: Changed variable name from filePath to file.path
      const fileDir=path.dirname(filePath);

      await fs.mkdir(fileDir,{recursive: true});
      await fs.writeFile(filePath,file.content,'utf-8');
      printSystem(chalk.green(`. ${file.path}`))
   }
   return appDir;
}

export async function generateApplication ( description,aiService,cwd=process.cwd()){
    try{
  printSystem(chalk.cyan('\n Agent mode: Generating your Application...\n')); // MINOR: Fixed spelling "Apllication"
  printSystem(chalk.gray(`Request: ${description}`));
  printSystem(chalk.magenta('Agent Response"\n'));
  const result=await generateObject({ // MINOR: Changed from destructuring to simple result
    model:aiService.model,
    schema:ApplicationSchema,
    prompt:`
    
    You are an expert full-stack architect, DevOps engineer, and senior software engineer.  
Generate a complete, production-ready application for: ${description}

I want you to produce all files exactly as a real working project would have them.  
For every file, output the full path and full code.

When generating the application, follow these rules:

1. CODE QUALITY  
   - Use clean, maintainable, scalable architecture.  
   - Use industry best practices for backend, frontend, and infrastructure.  
   - Write fully functional production-ready code—no placeholders.  
   - Add comments where needed.

2. FOLDER STRUCTURE  
   - Include a complete folder structure for the entire project.  
   - Include frontend, backend, config files, Dockerfiles, CI/CD, tests, and environment examples.

3. BACKEND REQUIREMENTS  
   - Proper routing, controllers, services, models.  
   - Environment variable support (.env.example).  
   - JWT or OAuth authentication (if needed).  
   - Database integration (MongoDB/Postgres/MySQL).  
   - Include schema files and migration setup.

4. FRONTEND REQUIREMENTS  
   - Modern UI with reusable components.  
   - Use Tailwind CSS or specified UI framework.  
   - Include API service files and state management (if needed).

5. DEPLOYMENT & DEVOPS  
   - Provide Dockerfile + docker-compose for local + production.  
   - Provide CI/CD workflow (GitHub Actions).  
   - Provide cloud deployment setup (AWS, DigitalOcean, Render, or Vercel).  
   - Include instructions to run, build, deploy.

6. DOCUMENTATION  
   - Include README.md with setup steps, commands, and deployment instructions.  
   - Include notes about environment variables, secrets, and project architecture.

7. SECURITY & PERFORMANCE  
   - Use secure headers, input validation, sanitization.  
   - Use best practices for API security, CORS, rate limiting if required.  
   - Optimize builds for production.

After following all rules above:

👉 Generate the full application for the following idea:  
${description}
    `
  })
  const application = result.object; // MINOR: Extract object from result
  
  printSystem(chalk.green(`\n Generated: ${application.folderName}\n`));
  printSystem(chalk.gray(`Description: ${application.description}\n`)); // MINOR: Fixed lowercase "description"
  if(application.files.length===0){
   throw new Error('No files generated');
  }
  displayFileTree(application.files,application.folderName);

  printSystem(chalk.cyan('\n Creating files....\n')); // MINOR: Fixed spelling "Creting"
  const appDir=await createApplicationFiles(
   cwd,
   application.folderName,
   application.files
  );
  printSystem(chalk.green.bold(`\n Application created Successfully \n`));
   printSystem(chalk.cyan(`\n Location:    ${chalk.bold(appDir)} \n`));
   if(application.setupCommands.length>0){
      printSystem(chalk.cyan('Next steps:\n'));
      printSystem(chalk.white('```bash')); // MINOR: Fixed backticks from '````' to '```'
      application.setupCommands.forEach((cmd)=>{
         printSystem(chalk.white(cmd));
      });
      printSystem(chalk.white("```\n"));
   }
   return {
      folderName:application.folderName,
      appDir,
      files:application.files.map(f=>f.path),
      commands:application.setupCommands,
      success:true
   }
    }
    catch(e){
   printSystem(chalk.red(`\n Error in generating Application:   ${e.message}`));
   if(e.stack){
      printSystem(chalk.dim(e.stack+'\n')); // MINOR: Fixed variable name from "error" to "e"
   }
    }
}





  