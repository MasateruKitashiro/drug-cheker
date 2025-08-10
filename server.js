require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Dify APIの情報を環境変数から取得
const difyApiKey = process.env.DIFY_API_KEY;
const difyApiUrl = 'https://api.dify.ai/v1/workflows/run';

// JSONリクエストボディをパースするためのミドルウェア
app.use(express.json());
// 静的ファイル（HTML, CSS, JS）を提供
app.use(express.static(path.join(__dirname)));

// APIエンドポイントの作成
app.post('/api/check', async (req, res) => {
    const { drug_name, ope_day } = req.body;

    if (!drug_name || !ope_day) {
        return res.status(400).json({ error: '薬剤名と手術予定日を入力してください。' });
    }

    const requestData = {
        inputs: {
            drug_name: drug_name,
            ope_day: ope_day
        },
        response_mode: 'blocking',
        user: 'webapp-user'
    };

    try {
        const response = await fetch(difyApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${difyApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Dify API Error:', errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        res.json(result);

    } catch (error) {
        console.error('Error calling Dify API:', error);
        res.status(500).json({ error: 'APIの呼び出し中にエラーが発生しました。' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
