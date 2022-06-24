import axios from 'axios';
import jsdom from 'jsdom';
import { stripHtml } from "string-strip-html";
import { v4 } from 'uuid';

const ankiConnectEndpoint = "localhost:8765";

// CAPTURAR OS EXEMPLOS

const result = await axios.get("https://dictionary.cambridge.org/dictionary/english/chart?q=charted");
const dom = new jsdom.JSDOM(result.data);
let examples = [];
dom.window.document.querySelectorAll(".examp").forEach(examp => examples.push(stripHtml(examp.innerHTML).result));

exemples = exemples.sort((a,b) => a.length - b.length).slice(0, 5);

for(const example of examples){
    try{
        const translate = await getTraducao(example);
        await axios.request({
            method: 'POST',
            url: 'http://localhost:8765',
            data: {
                action: "addNote",
                version: 6,
                params: {
                    note: {
                        deckName: "English::Pronunciation and Vocabulary and New Flash Cards",
                        modelName: "Basic",
                        fields: {
                            Front: example,
                            Back: translate
                        },
                        options: {
                            allowDuplicate: false,
                            duplicateScope: "deck",
                            duplicateScopeOptions: {
                                deckName: "English::Pronunciation and Vocabulary and New Flash Cards",
                                checkChildren: true,
                                checkAllModels: true
                            }
                        },
                        audio: [{
                            url: `http://dict.youdao.com/dictvoice?audio=${example}&type=en-US`,
                            filename: `${v4()}.mp3`,
                            fields: [
                                "Front"
                            ]
                        }]
                    }
                }
            }
        });
    } catch(e){
        console.log(e);
    }
}

// TRADUZIR OS EXEMPLOS

async function getTraducao(text){
    const encodedParams = new URLSearchParams();
    encodedParams.append("text", text);
    encodedParams.append("key", "trnsl.1.1.20220623T195201Z.6311d281c4fa5435.07e43d7e2da3665d043a85dbaa999f9d5a0e5fa5");
    encodedParams.append("lang", "en-pt");

    const requestTranslate = await axios.request({
        method: 'POST',
        url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/gzip'
        },
        data: encodedParams
    });

    return requestTranslate.data.text[0];
}