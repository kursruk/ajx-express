const request = require('request');

let good = 0, bad = 0;
for (let i=0; i<240; i++) {
    request.get(
        'http://localhost:3000/',  '',
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body)
                console.log('Status: '+response.statusCode, 'Good: '+good+' Bad:'+bad);
                good++;
            } else { 
                console.log('Error: '+error+' '+body, 'Good: '+good+' Bad:'+bad);
                bad++;
            }
        }
    );
}
