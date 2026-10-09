const fs = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config()
const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
    const rawData = await fs.readFile(path.join(__dirname, 'dataset.json'));
    const dataset = JSON.parse(rawData)

    if(Array.isArray(dataset)) {
        for(const item of dataset) {
            const result = await runTestCase(item.task)
            console.log('Test Result:', result)
        }
    }
}

async function runTestCase(task) {
    const output = await executeTask(task)
    const evaluation = await gradeByModel(task, output)
    return {
        "task": task,
        "output": output
    }
}

async function executeTask(task) {
    const user_prompt = `Please solve the following - ${task}
        Output Rules -
        - Begin your reply with the line <json> and nothing before it
        - End with the line </json> and write nothing after it.
    `
    const messages = []
    add_user_message(messages, user_prompt)
    output = await chat(messages)
    const taskResult = output.replace(/^\s*<json>\s*/, '').trim();
    return taskResult
    
}


async function gradeByModel(task, taskResult) {
    const eval_prompt = `
        You are an expert code reviewer. Evaluate this AI-generated solution:
        Task : ${task}
        solution : ${taskResult}

        Provide your evaluation as a structured JSON object with 
        - "Strengths" - An array of 1-3 key strengths
        - "Weaknesses" - An array of 1-3 key weaknesses
        - "reasoning" - A concise explanation of you assessment
        - "Score" - A number between 0 and 10   

        Output Rules -
        - Begin your reply with the line <json> and nothing before it
        - End with the line </json> and write nothing after it.
    `
    const messages = []
    add_user_message(messages, eval_prompt)
    const output = await chat(messages)
    const eval_result = output.replace(/^\s*<json>\s*/, '').trim();
    return eval_result
}

function add_user_message(messages, user_prompt) {
    messages.push({ role: 'user', content: user_prompt })
}

async function chat(messages, system_prompt) {
    const params = {
        model: "claude-sonnet-5-5",
        messages: messages,
        max_tokens: 8192,
        stop_sequences:['</json>', '```']
    }
    if(system_prompt && system_prompt.trim() !== "") {
        params.system = system_prompt;
    }
 
    const response = await client.messages.create(params);

    const reply = response.content.filter(
         block => block.type == 'text'
     ).map(block => block.text).join(' ');
     return reply
}

main()
