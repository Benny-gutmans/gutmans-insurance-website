// Find Care — member provider lookup
//
// CONFIG: set RBP_SUBMISSION_EMAIL once the destination address is known.
// Submissions go to this address via formsubmit.co. The first submission to a
// brand-new address triggers a one-time confirmation email from formsubmit
// that must be clicked to activate the inbox.
const RBP_SUBMISSION_EMAIL = 'REPLACE_ME@example.com';

// Per-network directory entry points. ZIP can't be injected into most of
// these directories via URL, so we rely on the "Copy ZIP" button for paste.
const NETWORKS = {
    firsthealth: {
        name: 'FirstHealth',
        directoryUrl: 'https://providerlocator.firsthealth.com/'
    },
    healthsmart: {
        name: 'HealthSmart',
        directoryUrl: 'https://www.healthsmart.com/Networks/HealthSmart-Preferred-Network/Find-a-Provider'
    },
    magnacare: {
        name: 'MagnaCare',
        directoryUrl: 'https://provider.magnacare.com/'
    },
    everpoint: {
        name: 'Everpoint',
        directoryUrl: 'https://www.google.com/search?q=Everpoint+network+provider+directory'
    },
    prime: {
        name: 'Prime',
        directoryUrl: 'https://primehealthservices.com/find-a-provider/'
    }
};

const state = {
    firstName: '',
    lastName: '',
    groupId: '',
    memberId: '',
    networkKey: '',
    networkName: '',
    zip: ''
};

document.addEventListener('DOMContentLoaded', () => {
    const lookupForm = document.getElementById('lookup-form');
    const networkSelect = document.getElementById('network');
    const otherWrap = document.getElementById('otherNetworkField');
    const networkOther = document.getElementById('networkOther');

    const lookupSection = document.getElementById('lookup');
    const resultsSection = document.getElementById('results');
    const issueSection = document.getElementById('issue');

    const editInfoBtn = document.getElementById('editInfoBtn');
    const openIssueBtn = document.getElementById('openIssueBtn');
    const cancelIssueBtn = document.getElementById('cancelIssueBtn');

    const copyZipBtn = document.getElementById('copyZip');
    const primaryDirectoryLink = document.getElementById('primaryDirectoryLink');
    const directoryHeading = document.getElementById('directoryHeading');

    const sumName = document.getElementById('sumName');
    const sumNetwork = document.getElementById('sumNetwork');
    const sumIds = document.getElementById('sumIds');
    const sumZip = document.getElementById('sumZip');

    const issueForm = document.getElementById('issue-form');
    const successModal = document.getElementById('successModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    // Toggle "Other" network input
    networkSelect.addEventListener('change', () => {
        const showOther = networkSelect.value === 'other';
        otherWrap.hidden = !showOther;
        networkOther.required = showOther;
        if (!showOther) networkOther.value = '';
    });

    // Lookup form submit
    lookupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateLookup(lookupForm)) return;

        const fd = new FormData(lookupForm);
        state.firstName = (fd.get('firstName') || '').toString().trim();
        state.lastName = (fd.get('lastName') || '').toString().trim();
        state.groupId = (fd.get('groupId') || '').toString().trim();
        state.memberId = (fd.get('memberId') || '').toString().trim();
        state.networkKey = (fd.get('network') || '').toString();
        state.zip = (fd.get('zip') || '').toString().trim();

        if (state.networkKey === 'other') {
            state.networkName = (fd.get('networkOther') || '').toString().trim() || 'Your network';
        } else {
            state.networkName = NETWORKS[state.networkKey] ? NETWORKS[state.networkKey].name : state.networkKey;
        }

        renderResults();
        lookupSection.hidden = true;
        resultsSection.hidden = false;
        issueSection.hidden = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function validateLookup(form) {
        let ok = true;
        form.querySelectorAll('.fc-field').forEach(f => f.classList.remove('fc-field-error'));

        const required = ['firstName', 'lastName', 'groupId', 'memberId', 'network', 'zip'];
        required.forEach(name => {
            const el = form.elements[name];
            if (!el) return;
            if (!el.value || (name === 'zip' && !/^\d{5}$/.test(el.value))) {
                el.closest('.fc-field').classList.add('fc-field-error');
                ok = false;
            }
        });

        if (form.elements['network'].value === 'other') {
            const otherEl = form.elements['networkOther'];
            if (!otherEl.value.trim()) {
                otherEl.closest('.fc-field').classList.add('fc-field-error');
                ok = false;
            }
        }
        return ok;
    }

    function renderResults() {
        sumName.textContent = `${state.firstName} ${state.lastName}`;
        sumNetwork.textContent = state.networkName;
        sumIds.textContent = `${state.groupId} / ${state.memberId}`;
        sumZip.textContent = state.zip;

        const cfg = NETWORKS[state.networkKey];
        let directoryUrl;
        if (cfg) {
            directoryUrl = cfg.directoryUrl;
        } else {
            // "Other" or unknown — fall back to a Google search
            const q = encodeURIComponent(`${state.networkName} provider directory`);
            directoryUrl = `https://www.google.com/search?q=${q}`;
        }

        primaryDirectoryLink.href = directoryUrl;
        primaryDirectoryLink.textContent = `Open ${state.networkName} Directory`;
        directoryHeading.textContent = `Search ${state.networkName} providers near you`;

        // Wire specialty quick-search buttons → Google Maps for {specialty} near {ZIP}
        document.querySelectorAll('.fc-specialty').forEach(btn => {
            const specialty = btn.dataset.specialty || '';
            btn.onclick = () => {
                const q = encodeURIComponent(`${specialty} near ${state.zip}`);
                window.open(`https://www.google.com/maps/search/${q}`, '_blank', 'noopener');
            };
        });
    }

    // Edit info → return to form
    editInfoBtn.addEventListener('click', () => {
        resultsSection.hidden = true;
        issueSection.hidden = true;
        lookupSection.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Copy ZIP
    copyZipBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(state.zip);
            copyZipBtn.classList.add('copied');
            const original = copyZipBtn.textContent;
            copyZipBtn.textContent = 'Copied';
            setTimeout(() => {
                copyZipBtn.classList.remove('copied');
                copyZipBtn.textContent = original;
            }, 1600);
        } catch (err) {
            // Fallback: select text manually
            const range = document.createRange();
            range.selectNode(sumZip);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    });

    // Open issue / RBP form (prefill from state)
    openIssueBtn.addEventListener('click', () => {
        document.getElementById('issueName').value = `${state.firstName} ${state.lastName}`.trim();
        document.getElementById('issueGroupId').value = state.groupId;
        document.getElementById('issueMemberId').value = state.memberId;
        document.getElementById('issueNetwork').value = state.networkName;
        document.getElementById('issueZip').value = state.zip;

        issueSection.hidden = false;
        issueSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    cancelIssueBtn.addEventListener('click', () => {
        issueSection.hidden = true;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Issue form submit
    issueForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateIssue(issueForm)) return;

        const submitBtn = issueForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Add formsubmit.co control fields
            const fd = new FormData(issueForm);
            fd.append('_subject', `Member care request — ${fd.get('name') || ''}`);
            fd.append('_template', 'table');
            fd.append('_captcha', 'false');

            // formsubmit.co's regular endpoint accepts multipart uploads but
            // responds with a cross-origin redirect that fetch can't read.
            // Submit with no-cors so the upload still goes through.
            await fetch(`https://formsubmit.co/${encodeURIComponent(RBP_SUBMISSION_EMAIL)}`, {
                method: 'POST',
                mode: 'no-cors',
                body: fd
            });

            successModal.hidden = false;
            issueForm.reset();
        } catch (err) {
            const fd = new FormData(issueForm);
            fallbackMailto(fd);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    function validateIssue(form) {
        let ok = true;
        form.querySelectorAll('.fc-field').forEach(f => f.classList.remove('fc-field-error'));
        ['name', 'email', 'issueType', 'message'].forEach(name => {
            const el = form.elements[name];
            if (!el) return;
            if (!el.value || (name === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value))) {
                el.closest('.fc-field').classList.add('fc-field-error');
                ok = false;
            }
        });
        return ok;
    }

    function fallbackMailto(fd) {
        const subject = encodeURIComponent(`Member care request — ${fd.get('name') || ''}`);
        const lines = [];
        ['name', 'email', 'phone', 'memberId', 'groupId', 'network', 'zip', 'issueType'].forEach(k => {
            const v = fd.get(k);
            if (v) lines.push(`${k}: ${v}`);
        });
        lines.push('');
        lines.push('Message:');
        lines.push((fd.get('message') || '').toString());
        const body = encodeURIComponent(lines.join('\n'));
        // Note: mailto can't carry attachments. The user will need to attach
        // them in their own mail client.
        window.location.href = `mailto:${RBP_SUBMISSION_EMAIL}?subject=${subject}&body=${body}`;
        successModal.hidden = false;
    }

    // Close success modal
    closeSuccessBtn.addEventListener('click', () => {
        successModal.hidden = true;
        issueSection.hidden = true;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.hidden = true;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !successModal.hidden) successModal.hidden = true;
    });
});
