var formatToConvert = document.getElementById("formatToConvert")
var separateur = document.getElementById("separateur")
formatToConvert.onclick = function () {
    if (formatToConvert == "txt" || formatToConvert == "csv") {
        separateur.disabled = true;
    } else {
        separateur.disabled = false;
    }
} // disable function

/*
<select id="formatToConvert" name="formatToConvert" required onclick = '<%- disable %>'>
            <option value='0'>--Choisissez votre format--</option>
            <option value='txt'>txt</option>
            <option value='csv'>csv</option>
            <option value='json'>json</option>

</select>

<script src="../testDisable.js" type="text/javascript"></script>
*/