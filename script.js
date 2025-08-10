document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('drug-form');
    const resultList = document.getElementById('result-list');
    const loadingIndicator = document.getElementById('loading');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submission triggered.');

        const drugName = document.getElementById('drug-name').value;
        const opeDay = document.getElementById('ope-day').value;

        if (!drugName || !opeDay) {
            alert('薬剤名と手術予定日を入力してください。');
            return;
        }

        console.log('Drug Name:', drugName);
        console.log('Surgery Date:', opeDay);

        const requestData = {
            drug_name: drugName,
            ope_day: opeDay
        };

        console.log('Sending data to backend:', JSON.stringify(requestData, null, 2));

        // ローディング表示
        loadingIndicator.classList.remove('hidden');
        resultList.innerHTML = ''; // 前回の結果をクリア

        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('Received response from backend:', response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Parsed backend result:', result);

            // Difyからのレスポンス構造を想定してテキストを取得
            const responseText = result.data.outputs.text;

            if (responseText) {
                // テキストを改行で分割してリスト表示する
                const items = responseText.split('\n').filter(item => item.trim() !== '');
                items.forEach(itemText => {
                    const listItem = document.createElement('li');
                    listItem.textContent = itemText;
                    resultList.appendChild(listItem);
                });
            } else {
                 const listItem = document.createElement('li');
                 listItem.textContent = '有効な結果が得られませんでした。';
                 resultList.appendChild(listItem);
            }

        } catch (error) {
            console.error('Error fetching data from backend:', error);
            const errorItem = document.createElement('li');
            errorItem.textContent = `エラーが発生しました: ${error.message}`;
            errorItem.style.color = 'red';
            resultList.appendChild(errorItem);
        } finally {
            // ローディング非表示
            loadingIndicator.classList.add('hidden');
        }
    });
});