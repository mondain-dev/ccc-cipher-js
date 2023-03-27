import "babel-polyfill";

const base32 = require("base32.js");

{
    // base32 codes
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    const B = base32Chars.length // i.e. 32
    const NCodePoints = B * B + B // 32*32+32 = 1056
    var dictBase32Decoding = new Object();
    for(var k=0; k<base32Chars.length; k++){
        dictBase32Decoding[base32Chars[k]] = k;
    };

    // CCC codes
    var dictCCCDecoding = require("./CCCDecoding.json");
    var dictCCCEncoding = require("./CCCEncoding.json");
    const MAXCCC = 9999;

    function codePointToCJK(codePoint){
        let CCCCodePoint;
        for(let k = 0; k*NCodePoints < MAXCCC; k++){
            if(codePoint + NCodePoints * k < MAXCCC){
                CCCCodePoint = ('0000' + (codePoint + NCodePoints * k)).slice(-4);
                if(dictCCCDecoding.hasOwnProperty(CCCCodePoint))
                {
                    let sCJK = dictCCCDecoding[CCCCodePoint].split(' ');
                    return(sCJK[(Math.random() * sCJK.length) | 0]);
                }
            }
        }
    }

    function CJKToCodePoint(charCJK){
        if(dictCCCEncoding.hasOwnProperty(charCJK)){
            return(dictCCCEncoding[charCJK] % NCodePoints);
        }
    }

    function base32ToCodePoint(strBase32){
        if(strBase32.length==2){
            return(B*dictBase32Decoding[strBase32[0]] + dictBase32Decoding[strBase32[1]]);
        }
        else{
            return(B*B+dictBase32Decoding[strBase32[0]]);
        }
    }

    function codePointToBase32(codePoint){
        if(codePoint < B*B){
            return(base32Chars[Math.floor(codePoint/B)]+base32Chars[codePoint%B]);
        }
        else{
            return(base32Chars[codePoint - B*B]);
        }
    }

    function base32ToCJK(textBase32){
        let strBase32 = textBase32.replace(/\r?\n|\r|=+/g, "");
        let strCJK = '';
        for(var k = 0; 2 * k < strBase32.length; k++){
            strCJK += codePointToCJK(base32ToCodePoint(strBase32.slice(2*k, 2*k+2)));
        }
        return strCJK;
    }

    function CJKToBase32(textCJK){
        let strCJK = textCJK.replace(/\r?\n|\r/g, "")
        let strBase32 = '';
        for(var k = 0; k < strCJK.length; k++){
            strBase32 += codePointToBase32(CJKToCodePoint(strCJK[k]));
        }
        if(strBase32.length % 8 == 2)
        {
            strBase32 += "======";
        }
        else if(strBase32.length % 8 == 4){
            strBase32 += "====";
        }
        else if(strBase32.length % 8 == 5){
            strBase32 += "===";
        }
        if(strBase32.length % 8 == 7){
            strBase32 += "=";
        }
        return(strBase32);
    }

    function encode(plaintext){
        let utf8Encode = new TextEncoder();
        let base32Encoder = new base32.Encoder();
        let encodededBase32 = base32Encoder.write(utf8Encode.encode(plaintext)).finalize().toUpperCase();
        return(base32ToCJK(encodededBase32));
    }

    function decode(textCJK){
        let utf8Decode = new TextDecoder();
        let base32Decoder = new base32.Decoder();
        let encodededBase32 = CJKToBase32(textCJK).toLowerCase();
        let buf = new Uint8Array(base32Decoder.write(encodededBase32).finalize()).buffer;
        console.log(buf);
        return( utf8Decode.decode(buf) );
    }

    const decodeBtn = document.getElementById('decode-btn');
    const encodeBtn = document.getElementById('encode-btn');

    encodeBtn.addEventListener('click', e=>{
        document.getElementById('encoded').value = '';
        const encoded = encode(document.getElementById('text').value);
        document.getElementById('encoded').value = encoded;
    });

    decodeBtn.addEventListener('click', e=>{
        document.getElementById('text').value = '';
        const decoded = decode(document.getElementById('encoded').value);
        document.getElementById('text').value = decoded;
    });
}