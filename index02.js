require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  // Create the interface
    const rl = readline.createInterface({ input, output });
    const messages = [];
    System_prompt = "You are a patient math tutur. Do not directly answer a student's question. Guide them to a solution step by step.";
    while (true) {
        const input = await rl.question('You: ');
        if(input.trim().toLowerCase() === 'exit') {
            console.log('Exiting...');
            rl.close();
            break;
        }
        messages.push({ role: 'user', content: input });
        const stream = await client.messages.stream({
            model: "claude-sonnet-5-5",
            messages: messages,
            max_tokens: 1024,
            system: System_prompt
        });
        output.write('Claude: ');
        stream.on('text', (text) => output.write(text));

        // Resolves once the stream completes; rejects on error
        const finalMessage = await stream.finalMessage()
        output.write('\n\n');
        
        const reply = finalMessage.content.filter(
            block => block.type == 'text'
        ).map(block => block.text).join(' ');

        if(!reply) {
            console.log('No reply received from Claude.');
            messages.pop(); // Remove the last user message since there was no reply
            continue; // Skip adding an assistant message and continue the loop
        }

        messages.push({ role: 'assistant', content: reply });
        console.log(`Claude: ${reply}`);
    }
}

main().catch(console.error);