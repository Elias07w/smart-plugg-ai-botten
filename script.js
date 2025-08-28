// Initiera TinyMCE för LanguageTool-integration
tinyMCE.init({
    mode: "specific_textareas",
    editor_selector: "editor",
    plugins: "AtD,paste",
    paste_text_sticky: true,
    setup: function(ed) {
        ed.onInit.add(function(ed) {
            ed.pasteAsPlainText = true;
        });
    },
    languagetool_rpc_url: "https://languagetool.org/api/v2/check",
    languagetool_i18n_current_lang: function() { return 'sv'; },
    theme: "advanced",
    theme_advanced_buttons1: "",
    theme_advanced_buttons2: "",
    theme_advanced_buttons3: "",
    theme_advanced_toolbar_location: "none",
    theme_advanced_statusbar_location: "bottom",
    theme_advanced_resizing: true,
    gecko_spellcheck: false
});

// Hantera filuppladdning
document.getElementById('loadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editor').value = e.target.result;
            tinyMCE.execCommand('mceAddControl', false, 'editor');
        };
        reader.readAsText(file);
    } else {
        alert('Välj en fil först!');
    }
});

// Kontrollera stavning och grammatik
document.getElementById('checkGrammar').addEventListener('click', function() {
    tinyMCE.activeEditor.execCommand("mceWritingImprovementTool", 'sv');
});

// Få strukturförslag med Hugging Face
document.getElementById('getSuggestions').addEventListener('click', function() {
    const description = document.getElementById('description').value;
    const text = document.getElementById('editor').value;
    if (!text || !description) {
        alert('Fyll i beskrivning och text!');
        return;
    }

    const prompt = `Ge konkreta förslag på hur man kan förbättra strukturen i denna text baserat på: ${description}. Text: ${text.substring(0, 500)}. Förklara vad som kan ändras (t.ex. lägg till rubriker, dela upp stycken), utan att skriva om hela texten. Svara på svenska.`;
    
    const API_TOKEN = 'hf_din_token_här'; // Byt ut mot din Hugging Face-token!
    fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt, max_length: 150 })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('suggestions').innerHTML = `<p>${data[0].generated_text}</p>`;
    })
    .catch(error => {
        console.error('Fel vid API-anrop:', error);
        document.getElementById('suggestions').innerHTML = '<p>Kunde inte hämta förslag just nu. Kontrollera din API-token eller försök igen senare.</p>';
    });
});
