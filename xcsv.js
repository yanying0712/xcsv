var DeltaOutput = "Date,Type,Exchange,Base amount,Base currency,Quote amount,Quote currency,Fee,Fee currency,Costs/Proceeds,Costs/Proceeds currency,Sync Holdings,Sent/Received from,Sent to,Notes".split(",");

var exchangeData = {};

var returnRow = function(exchange,data) {
    var result = [];
    for(var Column in DeltaOutput) {

        if( exchange[ DeltaOutput[Column] ] !== undefined) {
            // console.log(exchange[DeltaOutput[Column]]);
            var convertedData = exchange[ DeltaOutput[Column] ](data);

            if(convertedData !== undefined)
                result[Column] = convertedData;
            else
                result[Column] = "";
        } else {
            console.warn("Column " + DeltaOutput[Column] + " Not managed");
        }
    }
    return result;
};

var pushRow = function(results, temp_result){
    if(!(temp_result[3] == 0))
        if(!((temp_result[5] == 0 && temp_result[6]) || temp_result[4] == 'STR'))
            if(temp_result[0] !== 'Invalid date')
                if(temp_result[4].length <= 5)
                    if(temp_result[5] !== 'Addition')
                        results.push(temp_result.join(","));



    return results;
};

(function( $ ){

    var methods = {
        init : function(options) {

            for (var exchange in exchangeMapping) {

                if(exchange == "Binance") {
                    exchangeData[exchange] = {};

                    exchangeData[exchange].symbols = [];

                    for(var symbol in binanceData.symbols) {
                        if(!exchangeData[exchange].symbols.includes(binanceData.symbols[symbol].quoteAsset))
                            exchangeData[exchange].symbols.push(binanceData.symbols[symbol].quoteAsset);
                    }
                }

            }

        },

        // Attempt to detect the exchange
        detect : function ( pContent ) {
            var temp = pContent.split('\n');
            var tempTitle1 = temp[0].split(',');
            var tempTitle2 = [];
            tempTitle1.map(item=> {
                tempTitle2.push(item.trim());
            });
            temp[0] = tempTitle2;
            pContent = temp.join('\n');


            var csvdata = $.csv.toObjects(pContent);
            // for Coinbase
            var csvdata_Coinbase = $.csv.toObjects(pContent);


            if(csvdata.length > 3){
                var pContent_Coinbase = ((pContent.split('\n')).splice(3)).join('\n');

                csvdata_Coinbase = $.csv.toObjects(pContent_Coinbase);
            }

            for (var exchange in exchangeMapping) {
                var Matches = 0, NoMatch = 0;
                var Columns = exchangeMapping[exchange]._KnownCSVColumns();

                for(var KnownColumn in Columns) {

                    if(csvdata[0][Columns[KnownColumn]] !== undefined || csvdata_Coinbase[0][Columns[KnownColumn]] !== undefined)
                        ++Matches;
                    else
                        ++NoMatch;
                }

                if(Matches == Columns.length){
                    return exchange;
                }
            }

            for (var exchange in exchangeMapping) {
                var Matches = 0, NoMatch = 0;
                var Columns = exchangeMapping[exchange]._KnownCSVColumns();

                for(var KnownColumn in Columns) {
                    if(csvdata[0][Columns[KnownColumn]] !== undefined || csvdata_Coinbase[0][Columns[KnownColumn]] !== undefined)
                        ++Matches;
                    else
                        ++NoMatch;
                }
                if(Matches > NoMatch)
                    return exchange;
            }

            return false;
        },

        csvheader: function() {
            return DeltaOutput.join(",");
        },

        convert: function (pContent, pExchange) {
            var temp = pContent.split('\n');
            var tempTitle1 = temp[0].split(',');
            var tempTitle2 = [];
            tempTitle1.map(item=> {
                tempTitle2.push(item.trim());
            });
            temp[0] = tempTitle2;
            pContent = temp.join('\n');

            var exchange = exchangeMapping[pExchange];

            if (typeof exchange['_RenameCSVColumns'] !== "undefined") {
                pContent = pContent.replace( exchange._KnownCSVColumns(), exchange._RenameCSVColumns() );
            }

            var csvdata = undefined;

            if(pExchange === 'Coinbase'){
                // for Coinbase
                var pContent_Coinbase = ((pContent.split('\n')).splice(3)).join('\n');

                csvdata= $.csv.toObjects(pContent_Coinbase);
            }
            else if(pExchange === 'Gemini'){
                csvdata = $.csv.toObjects(pContent);
                csvdata.pop();
            }
            else{
                csvdata = $.csv.toObjects(pContent);
            }

            var results = [];

            if(pExchange === 'BTCMarkets'){
                console.log(csvdata.length);
                var pause = false;
                var pause_step = 0;
                var temp_result = [];
                function returnDate(data){
                    var date = moment(data['creationTime'], "YYYY-MM-DD, hh:mm aa");
                    return date.utc().format("YYYY-MM-DD hh:mm:ss Z");
                }
                function returnAmount(data){
                    var amount = data['amount'];
                    return Math.abs(amount.replace(/,/g, ''));
                }
                function returnType(data) {
                    var type = data['action'];
                    switch(type){
                        case 'Deposit':
                            return 'DEPOSIT';
                        case 'Withdraw':
                            return 'WITHDRAW';
                        case 'Buy Order':
                            return 'BUY';
                        case 'Sell Order':
                            return 'SELL';
                        case 'Trading Fee':
                            return 'BUY';
                        default:
                            return '';
                    }
                }
                for(var i in csvdata){
                    if(csvdata[i]['recordType'] === 'Fund Transfer'){
                        pause = false;
                        pause_step = 0;
                    }else{
                        pause = true;
                    }

                    if(pause === false){
                        temp_result = returnRow(exchange,csvdata[i]);
                        results = pushRow(results,temp_result);
                        temp_result = [];
                    }
                    else if(pause == true){
                        console.log('pause:',pause);
                        console.log('pause_step:',pause_step);

                        var action = csvdata[i]['action'];

                        console.log('action:',action);

                        switch (pause_step) {
                            case 0:
                                temp_result[0] = returnDate(csvdata[i]);
                                console.log('date:',temp_result);
                                temp_result[1] = returnType(csvdata[i]);
                                temp_result[2] = 'BTCMarkets';
                                if(action === 'Buy Order'){
                                    temp_result[5] = returnAmount(csvdata[i]);
                                    temp_result[6] = csvdata[i]['currency'];
                                }else{
                                    temp_result[3] = returnAmount(csvdata[i]);
                                    temp_result[4] = csvdata[i]['currency'];
                                }
                                temp_result[9] = temp_result[10] = temp_result[12] = temp_result[13] = '';
                                temp_result[11] = '1';
                                temp_result[14] = csvdata[i]['description'].replace(/\r?\n|\r|,/g, ' ');
                                break;
                            case 1:
                                if(action === 'Buy Order'){
                                    temp_result[3] = returnAmount(csvdata[i]);
                                    temp_result[4] = csvdata[i]['currency'];
                                }else{
                                    temp_result[5] = returnAmount(csvdata[i]);
                                    temp_result[6] = csvdata[i]['currency'];
                                }
                                break;
                            case 2:
                                temp_result[7] = returnAmount(csvdata[i]);
                                temp_result[8] = csvdata[i]['currency'];
                                console.log("temp 3:",JSON.stringify(results));

                                if(!(temp_result[3] == 0))
                                    if(!((temp_result[5] == 0 && temp_result[6]) || temp_result[4] == 'STR'))
                                        if(temp_result[0] !== 'Invalid date')
                                            if(temp_result[4].length <= 5)
                                                if(temp_result[5] !== 'Addition')
                                                    results.push(temp_result.join(","));
                                temp_result = [];
                                break;
                        }

                        pause_step ++;
                        if(pause_step === 3){
                            pause_step = 0;
                        }
                    }


                }

            }
            else{
                for(var i in csvdata) {
                    result = [];
                    result = returnRow(exchange,csvdata[i]);
                    results = pushRow(results,result);
                    result = [];
                }
            }

            return results.join('\n');
        }
    };

    $.fn.xcsv = function(methodOrOptions) {

        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));

        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {

            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.xcsv' );
        }    
    };

    // Sort the list of exchanges by name
    const ordered = {};
    Object.keys(exchangeMapping).sort().forEach(function(key) {
      ordered[key] = exchangeMapping[key];
    });

    exchangeMapping = ordered;
})( jQuery );
