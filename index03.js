require('dotenv').config()
const Anthropic = require('@anthropic-ai/sdk')
const fs = require('node:fs/promises');
const path = require('node:path');
const filePath = path.join(__dirname, 'dataset.json')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const messages = []

function add_user_message(user_prompt) {
    messages.push({ role: 'user', content: user_prompt })
}

function add_assistant_message(assistant_reply) {
    messages.push({ role: 'assistant', content: assistant_reply })
}

function extractCode(text) {
  const match = text.match(/^\s*```[\w-]*\s*\n([\s\S]*)\n```\s*$/);
  return (match ? match[1] : text).trim();
}

function stripCodeFences(text) {
  return text
    .replace(/^```[\w-]*\s*\n?/, '') // opening fence (with optional language tag)
    .replace(/\n?```\s*$/, '')       // closing fence
    .trim();
}

async function chat(messages, system_prompt) {

    const params = {
        model: "claude-sonnet-5-5",
        messages: messages,
        max_tokens: 8192
    }
    if(system_prompt && system_prompt.trim() !== "") {
        params.system = system_prompt;
    }
 
    const response = await client.messages.create(params);

    const reply = response.content.filter(
         block => block.type == 'text'
     ).map(block => block.text).join(' ');
     const dataset = JSON.parse(extractCode(reply))
     console.log(dataset)
     await fs.writeFile(filePath, JSON.stringify(dataset, null, 2), 'utf8');

    
}

const prompt = `Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate
prompts that generate Python, JSON, or Regex specifically for AWS-related tasks. Generate an array of JSON
objects, each representing a task that requires Python, JSON, or a Regex to complete.

Example Output:
\`\`\`json
[
    {
        "task": "Description of task"
    }
]
\`\`\`
* Focus on tasks that can be solved by writing a single python function, a single JSON object, or a single regex pattern.
* Focus on tasks that do not require writing much code
Please generate 3 objects
`;

async function main(prompt) {
    add_user_message(prompt)
    await chat(messages).catch(console.error);
}
main(prompt).catch(console.error);
