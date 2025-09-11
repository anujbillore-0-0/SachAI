// Initialize Lucide icons when page loads
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Initialize form handler
    const form = document.getElementById('fact-check-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    form.addEventListener('submit', handleFactCheck);
    
    async function handleFactCheck(e) {
        e.preventDefault();
        
        const textInput = document.getElementById('input-text');
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            const response = await fetch('/fact-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            displayResults(data);
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing your request. Please try again.');
        } finally {
            setLoadingState(false);
        }
    }
    
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Analyzing...';
            loadingDiv.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Fact-Check';
            loadingDiv.classList.add('hidden');
        }
    }
    
    function displayResults(data) {
        // Update claims badge
        const claimsBadge = document.getElementById('claims-badge');
        claimsBadge.textContent = `${data.verified_claims.length} claims verified`;
        
        // Display sources
        displaySources(data.verified_claims);
        
        // Display stats
        displayStats(data.stats);
        
        // Display claims
        displayClaims(data.verified_claims);
        
        // Display summary
        const summaryText = document.getElementById('summary-text');
        summaryText.textContent = data.summary;
        
        // Show results
        resultsDiv.classList.remove('hidden');
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    function displaySources(claims) {
        const sourcesList = document.getElementById('sources-list');
        const allSources = claims.flatMap(claim => claim.sources).slice(0, 3);
        
        sourcesList.innerHTML = allSources.map(source => `
            <div class="source-item">
                <i data-lucide="external-link" class="icon-primary" style="margin-top: 2px; flex-shrink: 0;"></i>
                <div class="source-content">
                    <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="source-title">
                        ${source.title}
                    </a>
                    <p class="source-text">
                        ${source.text.substring(0, 150)}...
                    </p>
                </div>
            </div>
        `).join('');
        
        // Re-initialize icons
        lucide.createIcons();
    }
    
    function displayStats(stats) {
        // Update percentage displays
        document.getElementById('supported-pct').textContent = `${stats.supported}%`;
        document.getElementById('refuted-pct').textContent = `${stats.refuted}%`;
        document.getElementById('insufficient-pct').textContent = `${stats.insufficient}%`;
        document.getElementById('conflicting-pct').textContent = `${stats.conflicting}%`;
        
        // Update progress bar
        document.getElementById('progress-supported').style.width = `${stats.supported}%`;
        document.getElementById('progress-refuted').style.width = `${stats.refuted}%`;
        document.getElementById('progress-refuted').style.left = `${stats.supported}%`;
        document.getElementById('progress-insufficient').style.width = `${stats.insufficient}%`;
        document.getElementById('progress-insufficient').style.left = `${stats.supported + stats.refuted}%`;
        document.getElementById('progress-conflicting').style.width = `${stats.conflicting}%`;
        document.getElementById('progress-conflicting').style.left = `${stats.supported + stats.refuted + stats.insufficient}%`;
    }
    
    function displayClaims(claims) {
        const claimsList = document.getElementById('claims-list');
        
        claimsList.innerHTML = claims.map((claim, index) => `
            <div class="claim-item">
                <button class="claim-header" onclick="toggleClaim(${index})">
                    <div class="claim-header-content">
                        <div class="claim-info">
                            ${getResultIcon(claim.result)}
                            <span class="result-badge result-${claim.result.toLowerCase()}">${claim.result}</span>
                            <span class="claim-text">
                                ${claim.claim_text.length > 100 
                                    ? claim.claim_text.substring(0, 100) + '...' 
                                    : claim.claim_text}
                            </span>
                        </div>
                        <i data-lucide="chevron-down" class="chevron" id="chevron-${index}"></i>
                    </div>
                </button>
                <div class="claim-content hidden" id="claim-content-${index}">
                    <div class="claim-section">
                        <h4>Full Claim:</h4>
                        <p>${claim.claim_text}</p>
                    </div>
                    <div class="claim-section">
                        <h4>Reasoning:</h4>
                        <p>${claim.reasoning}</p>
                    </div>
                    <div class="claim-section">
                        <h4>Sources:</h4>
                        <div class="claim-sources">
                            ${claim.sources.map(source => `
                                <div class="claim-source">
                                    <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="claim-source-link">
                                        ${source.title}
                                        <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
                                    </a>
                                    <p class="claim-source-text">
                                        ${source.text.substring(0, 200)}...
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Re-initialize icons
        lucide.createIcons();
    }
    
    function getResultIcon(result) {
        const icons = {
            'Supported': '<i data-lucide="check-circle" class="icon-supported"></i>',
            'Refuted': '<i data-lucide="x-circle" class="icon-refuted"></i>',
            'Insufficient': '<i data-lucide="help-circle" class="icon-insufficient"></i>',
            'Conflicting': '<i data-lucide="alert-circle" class="icon-conflicting"></i>'
        };
        return icons[result] || '';
    }
});

// Global function to toggle claims (called from onclick)
function toggleClaim(index) {
    const content = document.getElementById(`claim-content-${index}`);
    const chevron = document.getElementById(`chevron-${index}`);
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        chevron.setAttribute('data-lucide', 'chevron-up');
    } else {
        content.classList.add('hidden');
        chevron.setAttribute('data-lucide', 'chevron-down');
    }
    
    // Re-initialize icons to update the chevron
    lucide.createIcons();
}