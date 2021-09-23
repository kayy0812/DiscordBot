const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const simsimi = {
    simCommand: async function (msg, message) {
        try {
            console.log(msg)
            const response = await fetch(`https://api.simsimi.net/v2/?text=${msg}&lc=vi&cf=true`, {
                method: 'GET'
            });
            const data = await response.json();    
            for (const content of data.messages) {
                // Sim trả lời
                await message.reply(content.text);
            }
        } catch (error) {}
    }
}

module.exports = simsimi;