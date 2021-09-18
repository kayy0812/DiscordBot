const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const simsimi = {
    loadSimsimi: async function (config, args, message) {
        const response = await fetch(`https://api.simsimi.net/v2/?text=${args}&lc=en&cf=true`);
        const data = await response.json();
        
        for (const msg of data.messages) {
            // Sim trả lời
            message.reply(msg.text);
        }
    }
}

module.exports = simsimi;