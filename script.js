document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('calculateButton').addEventListener('click', calculateValues);
    document.getElementById('downloadPDFButton').addEventListener('click', downloadPDF);
});

function calculateValues() {
    const name = document.getElementById('name').value;
    const benefitEndDate = new Date(document.getElementById('benefitEndDate').value);
    const birthDate = new Date(document.getElementById('birthDate').value);
    const gender = document.getElementById('gender').value;
    const isRural = document.getElementById('isRural').checked;
    const monthlyAmount = parseFloat(document.getElementById('monthlyAmount').value);

    if (!name || !benefitEndDate || !birthDate) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const today = new Date();
    const fiveYearsAgo = new Date(today);
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    let retroactiveAmount = 0;
    let retroactiveValues = [];
    const retroactiveStartDate = new Date(Math.max(benefitEndDate, fiveYearsAgo));

    const monthsToConsider = Math.ceil((today - retroactiveStartDate) / (1000 * 60 * 60 * 24 * 30));
    let subtotal = 0;
    let currentDate = new Date(retroactiveStartDate);

    for (let i = 0; i < monthsToConsider; i++) {
        const value = monthlyAmount;
        retroactiveValues.push(`${currentDate.toLocaleDateString('pt-BR')} R$ ${formatCurrency(value)}`);
        subtotal += value;

        // Adicionando décimo terceiro
        if (currentDate.getMonth() === 11) { // Dezembro
            subtotal += monthlyAmount; // Adiciona o décimo terceiro
            retroactiveValues.push(`<span class="highlight-13">13/${currentDate.getFullYear()}</span> R$ ${formatCurrency(monthlyAmount)}`);
        }

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const yearsConsidered = Math.floor(monthsToConsider / 12);
    subtotal += yearsConsidered * (monthlyAmount / 12);
    retroactiveAmount = subtotal;

    let ongoingAmount = 0;
    let ongoingValues = [];
    const retirementAge = isRural ? (gender === 'male' ? 60 : 55) : (gender === 'male' ? 65 : 62);
    const retirementDate = new Date(birthDate);
    retirementDate.setFullYear(retirementDate.getFullYear() + retirementAge);

    if (today < retirementDate) {
        const endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + 24);
        const months = Math.ceil((retirementDate - endDate) / (1000 * 60 * 60 * 24 * 30));
        ongoingAmount = months * monthlyAmount + Math.floor(months / 12) * (monthlyAmount / 12);

        let currentMonth = new Date(endDate);
        for (let i = 0; i < months; i++) {
            ongoingValues.push(`${currentMonth.toLocaleDateString('pt-BR')} R$ ${formatCurrency(monthlyAmount)}`);
            // Adicionando décimo terceiro
            if (currentMonth.getMonth() === 11) { // Dezembro
                ongoingAmount += monthlyAmount; // Adiciona o décimo terceiro
                ongoingValues.push(`<span class="highlight-13">13/${currentMonth.getFullYear()}</span> R$ ${formatCurrency(monthlyAmount)}`);
            }
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
    }

    document.getElementById('retroactiveTotal').innerHTML = `Valor Retroativo Total: <span class="amount">${formatCurrency(retroactiveAmount)}</span>`;
    document.getElementById('ongoingTotal').innerHTML = `Valor Vincendo Total: <span class="amount">${formatCurrency(ongoingAmount)}</span>`;

    const totalValue = retroactiveAmount + ongoingAmount;
    document.getElementById('totalValue').innerHTML = `Valor Total: <span class="amount">${formatCurrency(totalValue)}</span>`;

    document.getElementById('clientName').innerText = `Nome do Cliente: ${name}`;

    const retroactiveValuesList = document.getElementById('retroactiveValues');
    retroactiveValuesList.innerHTML = '';
    retroactiveValues.forEach(value => {
        const li = document.createElement('li');
        li.innerHTML = value; // Usar innerHTML para renderizar o HTML
        retroactiveValuesList.appendChild(li);
    });

    const ongoingValuesList = document.getElementById('ongoingValues');
    ongoingValuesList.innerHTML = '';
    ongoingValues.forEach(value => {
        const li = document.createElement('li');
        li.innerHTML = value; // Usar innerHTML para renderizar o HTML
        ongoingValuesList.appendChild(li);
    });

    document.getElementById('results').style.display = 'block'; // Mostrar resultados
}

function downloadPDF() {
    const resultsContainer = document.getElementById('results');
    html2canvas(resultsContainer, { scale: 1 }).then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // largura da imagem em mm
        const pageHeight = 295; // altura da página A4 em mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('resultado_calculo.pdf');
    }).catch(error => {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF.");
    });
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
