// Initiera TinyMCE för LanguageTool-integration (markerar fel i rött)
tinyMCE.init({
    mode: "specific_textareas",
    editor_selector: "editor",  // Koppla till vår textarea med id="editor"
    plugins: "AtD,paste",
    paste_text_sticky: true,
    setup: function(ed) {
        ed.onInit.add(function(ed) {
            ed.pasteAsPlainText = true;
        });
    },
    languagetool_rpc_url: "https://languagetool.org/api/v2/check",  // Gratis API
    languagetool_i18n_current_lang: function() { return 'sv'; },  // Svenska
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
            tinyMCE.execCommand('mceAddControl', false, 'editor');  // Aktivera editor
        };
        reader.readAsText(file);
    } else {
        alert('Ladda upp en fil först!');
    }
});

// Kontrollera stavning/grammatik (använder LanguageTool via TinyMCE)
document.getElementById('checkGrammar').addEventListener('click', function() {
    tinyMCE.activeEditor.execCommand("mceWritingImprovementTool", 'sv');
});

// Få strukturförslag med Hugging Face (gratis API, byt ut till din token)
document.getElementById('getSuggestions').addEventListener('click', function() {
    const description = document.getElementById('description').value;
    const text = document.getElementById('editor').value;
    if (!text || !description) {
        alert('Fyll i beskrivning och text!');
        return;
    }
    
    const prompt = `Ge förslag på hur man kan förbättra strukturen i denna text baserat på: ${description}. Text: ${text.substring(0, 500)}. Förklara vad som kan ändras, utan att skriva om hela texten.`;
    
    // Hugging Face API-anrop (få en gratis token på huggingface.co/settings/tokens)
    const API_TOKEN = 'hf_din_token_här';  // Byt ut!
    fetch('https://api-inference.huggingface.co/models/gpt2', {  // Använd en bättre modell som 'gpt-neo-125m' för svenska-liknande förslag
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('suggestions').innerHTML = `<h3>Förslag:</h3><p>${data[0].generated_text}</p>`;
    })
    .catch(error => console.error('Fel:', error));
});