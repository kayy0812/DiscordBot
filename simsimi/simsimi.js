const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const simsimi = {
    loadSimsimi: async function (config, input, message) {
        const msg = input.replace(/'|"|`/g, '');
        try {
            const response = await fetch(`https://api.simsimi.net/v2/?text=${msg}&lc=vi&cf=true`, {
                method: 'GET'
            });
            const data = await response.json();    
            for (const msg of data.messages) {
                // Sim trả lời
                message.reply(msg.text);
            }
        } catch (error) {
            message.reply('Simsimi hiện không thể trả lời!');
        }
    }
}

module.exports = simsimi;