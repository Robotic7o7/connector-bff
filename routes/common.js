var express = require('express');
var router = express.Router();
const axios = require('axios');

router.post('/generate/otp', function(req, res, next) {
    var otpData = {
        mobileNumber: req.body.mobileNumber
    }
    var otpUrl = `${process.env.KDS_URL}/auth/otp/`
    axios.post(otpUrl, otpData,
        {
            headers: {
                'Authorization': `${process.env.KDS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    )
        .then((response) => {
            var data = response.data;
            console.log("otp sent")
            res.status(200).json(
                {
                    message:"otp sent" 
                }
            );
        },
            (error) => {
                console.log(error)
                console.log("error otp")
                res.status(500).json(
                    {
                        message:"error otp" 
                    }
                );
            }
        );
});


router.post('/generate/otp2', function(req, res, next) {
    const options = {
        method: 'POST',
        url: 'https://d7sms.p.rapidapi.com/secure/send',
        headers: {
          'content-type': 'application/json',
          Authorization: 'Basic dW9hdzg3OTY6eXZxMVE4U20=',
          'X-RapidAPI-Key': '6dfc0297fbmshb91bc0621b1cbdfp1cec0ajsna3f1809308a5',
          'X-RapidAPI-Host': 'd7sms.p.rapidapi.com'
        },
        data: '{"content":"Test Message","from":"D7-Rapid","to":916281508679}'
      };
      
      axios.request(options).then(function (response) {
          console.log(response.data);
      }).catch(function (error) {
          console.error(error);
      });
});


module.exports = router;
