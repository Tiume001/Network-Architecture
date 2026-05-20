document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scrollspy functionality ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.querySelector('.content-area');

    const observerOptions = {
        root: contentArea,
        rootMargin: '0px 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    // Scroll sidebar to ensure active link is visible
                    if (id === 'intro') {
                        const tocNav = document.querySelector('.toc-nav');
                        if (tocNav) {
                            tocNav.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    } else if (id === 'extra-sandbox') {
                        const tocNav = document.querySelector('.toc-nav');
                        if (tocNav) {
                            tocNav.scrollTo({ top: tocNav.scrollHeight, behavior: 'smooth' });
                        }
                    } else {
                        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Force absolute bottom sidebar sync on scrolling completely down
    if (contentArea) {
        contentArea.addEventListener('scroll', () => {
            const isBottom = contentArea.scrollHeight - contentArea.scrollTop - contentArea.clientHeight < 25;
            if (isBottom) {
                const tocNav = document.querySelector('.toc-nav');
                if (tocNav) {
                    tocNav.scrollTo({ top: tocNav.scrollHeight, behavior: 'smooth' });
                }
                navLinks.forEach(link => link.classList.remove('active'));
                const lastLink = navLinks[navLinks.length - 1];
                if (lastLink) {
                    lastLink.classList.add('active');
                }
            }
        });
    }

    // --- Copy to Clipboard Functionality ---
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-copy-target');
            const codeElement = document.getElementById(targetId);
            
            if (codeElement) {
                const textToCopy = codeElement.textContent;
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    button.textContent = 'Error';
                    setTimeout(() => { button.textContent = 'Copy'; }, 2000);
                });
            }
        });
    });

    // --- Image Modal (Lightbox) ---
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('img01');
    const captionText = document.getElementById('caption');
    const closeBtn = document.getElementsByClassName('close-modal')[0];

    const images = document.querySelectorAll('img:not(#img01)');

    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            let figcaption = this.parentElement.querySelector('figcaption');
            if(figcaption) {
                captionText.innerHTML = figcaption.innerHTML;
            } else {
                captionText.innerHTML = this.alt || '';
            }
        });
    });

    closeBtn.onclick = function() { modal.style.display = "none"; }
    modal.onclick = function(e) { if (e.target !== modalImg) modal.style.display = "none"; }
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.style.display === "block") modal.style.display = "none";
    });

    // --- NOC Telemetry Animation ---
    setInterval(() => {
        const latencyEl = document.getElementById('stat-latency');
        const throughputEl = document.getElementById('stat-throughput');
        
        if(latencyEl && throughputEl) {
            // Fake latency fluctuation around 0.20ms
            const baseLatency = 0.20;
            const newLatency = (baseLatency + (Math.random() * 0.10 - 0.05)).toFixed(2);
            latencyEl.textContent = `${newLatency}ms`;
            
            // Fake throughput fluctuation around 18.0 Gbps
            const baseThroughput = 18.4;
            const newThroughput = (baseThroughput + (Math.random() * 0.8 - 0.4)).toFixed(1);
            throughputEl.textContent = `${newThroughput} Gbps`;
        }
    }, 2500);
    // --- Intercept click on #intro to show Telemetry Bar ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (hash === '#intro') {
                e.preventDefault();
                history.pushState(null, null, '#intro');
                contentArea.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

});
// Force scroll to top on reload if no hash or if hash is intro
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (!window.location.hash || window.location.hash === '#intro') {
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
        }
    }, 50);

    // --- Layer 1 Physical Flow Animation ---
    const btnTrace = document.getElementById('btn-trace-signal');
    const logsContainer = document.getElementById('term-logs-container');

    function logTerm(msg, type = 'info') {
        if (!logsContainer) return;
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const div = document.createElement('div');
        div.className = 'log-line' + (type === 'warn' ? ' warn' : '');
        div.innerHTML = `<span class="timestamp">[${timeStr}]</span>${msg}`;
        logsContainer.appendChild(div);
        
        // Scroll the terminal body to bottom
        const termBody = logsContainer.closest('.term-body');
        if (termBody) termBody.scrollTop = termBody.scrollHeight;
    }

    function pulsePath(pathId, colorClass, duration, onComplete) {
        const originalPath = document.getElementById(pathId);
        if (!originalPath) return;

        // Clone path to create moving pulse
        const pulse = originalPath.cloneNode();
        pulse.removeAttribute('id');
        pulse.classList.remove('static-cable', 'dashed');
        pulse.classList.add('pulse-line', colorClass);

        const len = originalPath.getTotalLength();
        pulse.style.strokeDasharray = `20, ${len}`;
        pulse.style.strokeDashoffset = len;
        
        originalPath.parentNode.appendChild(pulse);

        // Force reflow
        void pulse.offsetWidth;

        pulse.style.transition = `stroke-dashoffset ${duration}ms linear, opacity 0.3s`;
        pulse.style.strokeDashoffset = '0';
        pulse.style.opacity = '1';

        setTimeout(() => {
            pulse.style.opacity = '0';
            setTimeout(() => pulse.remove(), 300);
            if (onComplete) onComplete();
        }, duration);
    }

    function activateNode(nodeId, active = true) {
        const node = document.getElementById(nodeId);
        if (node) {
            if (active) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        }
    }

    function activateTraffic(trafficId, active = true) {
        const traffic = document.getElementById(trafficId);
        if (traffic) {
            if (active) {
                traffic.classList.add('active');
            } else {
                traffic.classList.remove('active');
            }
        }
    }

    if(btnTrace) {
        btnTrace.addEventListener('click', () => {
            btnTrace.disabled = true;
            btnTrace.textContent = "Tracciamento in corso...";
            
            // Clean Terminal & Reset Nodes/Traffic
            if (logsContainer) logsContainer.innerHTML = '';
            
            const allNodes = document.querySelectorAll('.viz-node');
            allNodes.forEach(node => node.classList.remove('active'));

            const allTraffic = document.querySelectorAll('.live-traffic');
            allTraffic.forEach(t => t.classList.remove('active'));

            logTerm("Avvio scansione fisica L1 (Data Path)...");

            // Step 1: ISP -> ONT
            setTimeout(() => {
                activateNode('node-isp');
                logTerm("ISP: Invio segnale laser monomodale ad altissima intensità...");
                pulsePath('cable-isp-ont', 'pulse-orange', 1200, () => {
                    activateNode('node-ont');
                    activateTraffic('traffic-isp-ont');
                    logTerm("ONT: Segnale ottico ricevuto sulla porta GPON. Flusso di linea L1 stabilito.");
                    
                    // Step 2: ONT -> FW
                    setTimeout(() => {
                        logTerm("ONT: Conversione fotonica -> impulsi elettrici (+5V) completata.");
                        pulsePath('cable-ont-fw', 'pulse-cyan', 800, () => {
                            activateNode('node-fw');
                            activateTraffic('traffic-ont-fw');
                            logTerm("EDGE FW: Connessione WAN L1 stabilita.");

                            // Step 3: FW -> SW and FW -> VPN simultanei
                            setTimeout(() => {
                                logTerm("EDGE FW: Ispezione pacchetti L1/L2 completata. Routing verso Core LAN.");
                                logTerm("VPN: Inizializzazione pacchetti di tunneling crittografato L1/L3...", "warn");
                                
                                pulsePath('cable-fw-sw', 'pulse-cyan', 800, () => {
                                    activateNode('node-sw');
                                    activateTraffic('traffic-fw-sw');
                                    logTerm("CORE SW: Ricezione frame ethernet. Allineamento frequenze porte RJ45.");

                                    // Step 4: SW -> Endpoints simultanei
                                    setTimeout(() => {
                                        logTerm("CORE SW: Commutazione ad alta velocità su 3 percorsi fisici.");
                                        
                                        pulsePath('cable-sw-server', 'pulse-cyan', 900, () => {
                                            activateNode('node-server');
                                            activateTraffic('traffic-sw-server');
                                            logTerm("SERVER NAS: Cavo Cat.6A integro. Negoziazione 10Gbps OK.");
                                        });

                                        pulsePath('cable-sw-ap', 'pulse-cyan', 900, () => {
                                            activateNode('node-ap');
                                            activateTraffic('traffic-sw-ap');
                                            logTerm("WiFi AP: Alimentazione PoE stabilita. Onde radio L1 attive.");
                                        });

                                        pulsePath('cable-sw-pc', 'pulse-cyan', 900, () => {
                                            activateNode('node-pc');
                                            activateTraffic('traffic-sw-pc');
                                            logTerm("PC CLIENT: Collegamento L1 Up. Scheda NIC connessa.");
                                        });

                                    }, 800);
                                });

                                // VPN Path pulse (longer)
                                pulsePath('cable-fw-vpn', 'pulse-orange', 1800, () => {
                                    activateNode('node-vpn');
                                    activateTraffic('traffic-fw-vpn');
                                    logTerm("VPN: Tunnel crittografato Site-to-Site L1/L3 ONLINE con Sede Remota.", "warn");
                                });

                            }, 800);
                        });
                    }, 600);
                });
            }, 500);

            // Re-enable button when all phases finished (approx 7.5 seconds)
            setTimeout(() => {
                logTerm("Diagnostica di rete completata con successo. Stato hardware: 100% NOMINALE.");
                btnTrace.textContent = "⚡ Avvia Diagnostica Segnale";
                btnTrace.disabled = false;
            }, 7500);
        });
    }
});

// === LAYER 3: VPN vs SD-WAN Interactive Module ===
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('l3-mode-toggle');
    const vpnView = document.getElementById('l3-vpn-view');
    const sdwanView = document.getElementById('l3-sdwan-view');
    const lblVpn = document.getElementById('lbl-vpn');
    const lblSdwan = document.getElementById('lbl-sdwan');
    const vizTitle = document.getElementById('l3-viz-title');
    const btnSend = document.getElementById('btn-send-packet');
    const l3Logs = document.getElementById('l3-term-logs');
    const l3TermBody = document.getElementById('l3-term-body');

    if (!toggle || !btnSend) return;

    // Toggle labels
    lblVpn.classList.add('active-label');

    function l3Log(msg, type = 'info') {
        if (!l3Logs) return;
        const now = new Date();
        const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const div = document.createElement('div');
        div.className = 'log-line' + (type === 'warn' ? ' warn' : '');
        div.innerHTML = `<span class="timestamp">[${ts}]</span>${msg}`;
        l3Logs.appendChild(div);
        if (l3TermBody) l3TermBody.scrollTop = l3TermBody.scrollHeight;
    }

    function l3ActivateNode(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    }

    function l3AnimatePulse(pathId, color, duration, svg, onComplete) {
        const path = document.getElementById(pathId);
        if (!path) { if (onComplete) onComplete(); return; }
        
        const len = path.getTotalLength();
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '6');
        dot.setAttribute('fill', color);
        dot.classList.add('l3-pulse-dot');
        if (color !== '#ff4444') dot.classList.add('cyan');
        svg.appendChild(dot);

        const startTime = performance.now();
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const point = path.getPointAtLength(progress * len);
            dot.setAttribute('cx', point.x);
            dot.setAttribute('cy', point.y);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                dot.remove();
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(animate);
    }

    // Toggle handler
    toggle.addEventListener('change', () => {
        const isSDWAN = toggle.checked;
        vpnView.style.display = isSDWAN ? 'none' : '';
        sdwanView.style.display = isSDWAN ? '' : 'none';
        lblVpn.classList.toggle('active-label', !isSDWAN);
        lblSdwan.classList.toggle('active-label', isSDWAN);
        vizTitle.textContent = isSDWAN
            ? 'Simulazione Flusso L3: SD-WAN (Venezia → Ravenna)'
            : 'Simulazione Flusso L3: VPN IPsec (Venezia → Ravenna)';
        // Reset
        l3Logs.innerHTML = '';
        document.querySelectorAll('#l3-svg-canvas .viz-node').forEach(n => n.classList.remove('active'));
        const tube = document.getElementById('l3s-overlay-tube');
        if (tube) tube.classList.remove('l3s-overlay-active');
    });

    // Send Packet
    btnSend.addEventListener('click', () => {
        btnSend.disabled = true;
        btnSend.textContent = 'Trasmissione in corso...';
        l3Logs.innerHTML = '';
        document.querySelectorAll('#l3-svg-canvas .viz-node').forEach(n => n.classList.remove('active', 'l3-analyzing'));
        const tube = document.getElementById('l3s-overlay-tube');
        if (tube) tube.classList.remove('l3s-overlay-active');

        const svg = document.getElementById('l3-svg-canvas');
        const isSDWAN = toggle.checked;

        if (!isSDWAN) {
            // === VPN IPsec Animation ===
            l3Log('[L3 Routing] Pacchetto IP originato dalla LAN di Venezia (src: 10.0.1.15 → dst: 10.0.2.50).');
            setTimeout(() => {
                l3ActivateNode('l3v-server');
                l3Log('[ARP] Risoluzione MAC completata. Frame Ethernet consegnato al Default Gateway.');
                l3AnimatePulse('l3v-cable-srv-fw', '#ff4444', 1200, svg, () => {
                    l3ActivateNode('l3v-fw1');
                    l3Log('[Firewall Venezia] Pacchetto ricevuto su interfaccia GE0/1 (LAN).');
                    
                    setTimeout(() => {
                        l3Log('[IKE Phase 1] Negoziazione SA (Security Association) con peer 95.231.12.1...');
                        setTimeout(() => {
                            l3Log('[IKE Phase 2] Quick Mode completata. Algoritmo: AES-256-CBC + HMAC-SHA256.');
                            l3Log('[ESP] Incapsulamento IPsec: Header originale nascosto. Nuovo header IP pubblico applicato.');
                            setTimeout(() => {
                                l3Log('[Routing Statico] Tabella di routing consultata: ip route 10.0.2.0/24 via 82.105.4.254');
                                l3Log('[WAN] Pacchetto inoltrato su SINGOLO link Internet. Nessuna analisi di qualità.', 'warn');
                                l3Log('[CRITICITÀ] Se la linea degrada (jitter >50ms), il VoIP collassa. Nessun failover.', 'warn');
                                l3AnimatePulse('l3v-cable-fw-cloud', '#ff4444', 2000, svg, () => {
                                    l3Log('[Internet] Pacchetto in transito sulla rete pubblica. Attraversamento di 8 hop intermedi...');
                                    l3AnimatePulse('l3v-cable-cloud-fw2', '#ff4444', 2000, svg, () => {
                                        l3ActivateNode('l3v-fw2');
                                        l3Log('[Firewall Ravenna] Pacchetto ESP ricevuto su interfaccia WAN (GE0/0).');
                                        setTimeout(() => {
                                            l3Log('[ESP] Decapsulamento IPsec completato. Verifica integrità HMAC: OK.');
                                            l3Log('[NAT] Traduzione indirizzo inversa (dNAT) applicata.');
                                            l3AnimatePulse('l3v-cable-fw2-pc', '#ff4444', 800, svg, () => {
                                                l3ActivateNode('l3v-pc');
                                                l3Log('[PC Client] Pacchetto L3 consegnato a 10.0.2.50. RTT totale: 42ms.');
                                                l3Log('─── RIEPILOGO VPN IPsec ───');
                                                l3Log('Percorso: STATICO (nessuna scelta dinamica)', 'warn');
                                                l3Log('Link WAN utilizzati: 1/1 (nessuna ridondanza attiva)', 'warn');
                                                l3Log('Failover: MANUALE (richiede intervento BGP/OSPF, tempi >30s)', 'warn');
                                                l3Log('Sicurezza: Firewall SEPARATO dall\'apparato di routing', 'warn');
                                                l3Log('Costo infrastruttura: ELEVATO (MPLS dedicata)', 'warn');
                                                btnSend.textContent = '📡 Invia Pacchetto Dati';
                                                btnSend.disabled = false;
                                            });
                                        }, 600);
                                    });
                                });
                            }, 800);
                        }, 800);
                    }, 600);
                });
            }, 300);

        } else {
            // === SD-WAN Animation ===
            l3Log('[L3 Routing] Pacchetto IP originato dalla LAN di Venezia (src: 10.0.1.15 → dst: 10.0.2.50).');
            setTimeout(() => {
                l3ActivateNode('l3s-server');
                l3Log('[ARP] Risoluzione MAC completata. Frame consegnato all\'Edge SD-WAN Appliance.');
                l3AnimatePulse('l3s-cable-srv-edge', '#00d2ff', 800, svg, () => {
                    l3ActivateNode('l3s-edge1');
                    l3Log('[SD-WAN Edge Venezia] Pacchetto ricevuto. Inizio pipeline di classificazione.');

                    setTimeout(() => {
                        l3Log('[DPI Engine] Deep Packet Inspection: firma applicativa riconosciuta → Microsoft Teams (RTP/UDP).');
                        
                        // Analyzing phase - LED blink
                        setTimeout(() => {
                            const edge1 = document.getElementById('l3s-edge1');
                            if (edge1) edge1.classList.add('l3-analyzing');
                            l3Log('[vSmart Controller] Interrogazione Overlay Management Protocol (OMP) in corso...');
                            
                            setTimeout(() => {
                                l3Log('[BFD Probe] Sonda bidirezionale attiva ogni 10ms su tutti i tunnel:');
                                l3Log('  ├─ Fibra FTTH: Latenza 8ms | Jitter 2ms | Loss 0.00% | Stato: ✓ SLA OK', 'warn');
                                l3Log('  └─ 4G/LTE:     Latenza 45ms | Jitter 18ms | Loss 0.2% | Stato: ⚠ SLA VIOLATA', 'warn');
                                
                                setTimeout(() => {
                                    l3Log('[App-Route Policy] Match regola VOICE_SLA: loss<1%, latency<150ms, jitter<30ms.');
                                    l3Log('[SD-WAN Edge] DECISIONE: Instradamento su tunnel FIBRA (preferred-color mpls).');
                                    l3Log('[Overlay] Costruzione header VXLAN/IPsec sull\'Overlay virtuale SD-WAN.');
                                    l3Log('[NGFW L7] Ispezione sicurezza integrata: IPS + Antimalware + URL Filter → PASS.');
                                    
                                    // Activate overlay tube
                                    if (tube) tube.classList.add('l3s-overlay-active');

                                    setTimeout(() => {
                                        l3Log('[WAN] Pacchetto crittografato AES-256-GCM iniettato nell\'Overlay SD-WAN.');
                                        l3AnimatePulse('l3s-cable-fiber', '#00d2ff', 1000, svg, () => {
                                            l3ActivateNode('l3s-edge2');
                                            l3Log('[SD-WAN Edge Ravenna] Pacchetto ricevuto sul tunnel Overlay.');
                                            
                                            setTimeout(() => {
                                                l3Log('[Overlay] Decapsulamento VXLAN/IPsec completato. Pacchetto originale estratto.');
                                                l3Log('[NGFW L7] Ispezione ingresso Ravenna: contenuto verificato → CLEAN.');
                                                l3AnimatePulse('l3s-cable-edge2-pc', '#00d2ff', 600, svg, () => {
                                                    l3ActivateNode('l3s-pc');
                                                    l3Log('[PC Client] Pacchetto L3 consegnato a 10.0.2.50. RTT totale: 11ms.');
                                                    l3Log('─── RIEPILOGO SD-WAN ───');
                                                    l3Log('Percorso: DINAMICO (App-Aware Routing basato su telemetria BFD)');
                                                    l3Log('Link WAN utilizzati: 2/2 (Fibra attiva + LTE hot-standby)');
                                                    l3Log('Failover: AUTOMATICO sub-second (<300ms, trasparente all\'utente)');
                                                    l3Log('Sicurezza: NGFW L7 INTEGRATA nell\'Edge (IPS + Antimalware)');
                                                    l3Log('Costo infrastruttura: RIDOTTO (Broadband + LTE vs MPLS dedicata)');
                                                    l3Log('Miglioramento RTT: 42ms → 11ms (-74%)', 'warn');
                                                    btnSend.textContent = '📡 Invia Pacchetto Dati';
                                                    btnSend.disabled = false;
                                                });
                                            }, 500);
                                        });
                                    }, 600);
                                }, 1200);
                            }, 800);
                        }, 600);
                    }, 500);
                });
            }, 300);
        }
    });
});

// === LAYER 2: INTERACTIVE SWITCHING & VLAN MODULE ===
document.addEventListener('DOMContentLoaded', () => {
    const vlanToggle = document.getElementById('l2-vlan-toggle');
    const btnBroadcast = document.getElementById('btn-broadcast-v10');
    const btnUnicast = document.getElementById('btn-unicast-v40');
    const l2Logs = document.getElementById('l2-term-logs');
    const l2TermBody = document.getElementById('l2-term-body');

    // UI elements to update on toggle change
    const stateLabelLeft = document.getElementById('l2-state-label-left');
    const stateLabelRight = document.getElementById('l2-state-label-right');
    const switchChassisVlan = document.getElementById('l2-switch-chassis-vlan');
    const switchVlanLabels = document.getElementById('l2-switch-vlan-labels');
    const flatNetworkLabel = document.getElementById('l2-flat-network-label');
    const switchTitleText = document.getElementById('l2-switch-title-text');

    if (!btnBroadcast || !btnUnicast || !vlanToggle) return;

    function l2Log(msg, type = 'info') {
        if (!l2Logs) return;
        const now = new Date();
        const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const div = document.createElement('div');
        div.className = 'log-line' + (type === 'warn' ? ' warn' : '');
        div.innerHTML = `<span class="timestamp">[${ts}]</span>${msg}`;
        l2Logs.appendChild(div);
        if (l2TermBody) l2TermBody.scrollTop = l2TermBody.scrollHeight;
    }

    function l2ActivateNode(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    }

    function l2AnimatePulse(pathId, color, duration, svg, reverse = false, onComplete) {
        const path = document.getElementById(pathId);
        if (!path) { if (onComplete) onComplete(); return; }
        
        const len = path.getTotalLength();
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '6');
        dot.setAttribute('fill', color);
        dot.classList.add('l2-pulse-dot');
        if (color === '#00d2ff') dot.classList.add('cyan');
        if (color === '#ef5350') dot.classList.add('red');
        svg.appendChild(dot);

        const startTime = performance.now();
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const actualProgress = reverse ? (1 - progress) : progress;
            const point = path.getPointAtLength(actualProgress * len);
            dot.setAttribute('cx', point.x);
            dot.setAttribute('cy', point.y);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                dot.remove();
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(animate);
    }

    function resetL2Elements() {
        document.querySelectorAll('#l2-svg-canvas .viz-node').forEach(n => n.classList.remove('active'));
        const cam = document.getElementById('l2-cam-table');
        if (cam) cam.classList.remove('l2-cam-searching');
    }

    // Handle VLAN Toggle Changes
    vlanToggle.addEventListener('change', () => {
        const isConfigured = vlanToggle.checked;
        resetL2Elements();

        if (isConfigured) {
            // UI Visual transitions to VLAN Mode
            stateLabelLeft.style.color = '#8b949e';
            stateLabelRight.style.color = '#00d2ff';
            switchChassisVlan.style.opacity = '1';
            switchVlanLabels.style.opacity = '1';
            flatNetworkLabel.style.opacity = '0';
            switchTitleText.textContent = 'CORE SWITCH (VLAN 802.1Q)';
            vlanToggle.nextElementSibling.style.background = '#00d2ff';

            // Button Styles to reflect VLAN configured state
            btnBroadcast.style.background = 'rgba(255, 170, 0, 0.1)';
            btnBroadcast.style.borderColor = '#ffaa00';
            btnBroadcast.style.color = '#ffaa00';
            btnBroadcast.textContent = '📣 Invia Broadcast da Smartphone (VLAN 10)';

            btnUnicast.style.background = 'rgba(0, 210, 255, 0.1)';
            btnUnicast.style.borderColor = '#00d2ff';
            btnUnicast.style.color = '#00d2ff';
            btnUnicast.textContent = '💳 Invia Dati Transazione da POS 1 (VLAN 40)';

            l2Log('[IEEE 802.1Q Engine] Configurazione caricata. Abilitazione Tagging 802.1Q.');
            l2Log('[IEEE 802.1Q Engine] Switch segmentato logicamente: VLAN 10 (Guest) e VLAN 40 (POS/Bar) attive.', 'warn');
        } else {
            // UI Visual transitions to Flat Mode
            stateLabelLeft.style.color = '#ef5350';
            stateLabelRight.style.color = '#8b949e';
            switchChassisVlan.style.opacity = '0';
            switchVlanLabels.style.opacity = '0';
            flatNetworkLabel.style.opacity = '1';
            switchTitleText.textContent = 'SWITCH COASSIALE (FLAT)';
            vlanToggle.nextElementSibling.style.background = '#ef5350';

            // Button Styles to reflect Flat state
            btnBroadcast.style.background = 'rgba(239, 83, 80, 0.1)';
            btnBroadcast.style.borderColor = '#ef5350';
            btnBroadcast.style.color = '#ef5350';
            btnBroadcast.textContent = '📣 Invia Broadcast da Smartphone (Rete Piatta)';

            btnUnicast.style.background = 'rgba(239, 83, 80, 0.1)';
            btnUnicast.style.borderColor = '#ef5350';
            btnUnicast.style.color = '#ef5350';
            btnUnicast.textContent = '💳 Invia Dati Transazione da POS 1 (Rete Piatta)';

            l2Log('[L2 Engine] Ripristino configurazione di default. Disabilitazione Tagging 802.1Q.');
            l2Log('[L2 Engine] Switch unificato. Tutte le porte appartengono alla VLAN 1 di default.', 'warn');
        }
    });

    // Broadcast from Smartphone Action
    btnBroadcast.addEventListener('click', () => {
        btnBroadcast.disabled = true;
        btnUnicast.disabled = true;
        l2Logs.innerHTML = '';
        resetL2Elements();

        const svg = document.getElementById('l2-svg-canvas');
        const isConfigured = vlanToggle.checked;

        if (isConfigured) {
            // --- CONFIGURED VLAN SCENARIO ---
            l2Log('[L2 MAC Engine] Smartphone Guest 1 prepara un frame Broadcast (VLAN 10).');
            setTimeout(() => {
                l2ActivateNode('l2-smartphone');
                // Pulse Orange from smartphone to switch
                l2AnimatePulse('l2-cable-smart-sw', '#ffaa00', 900, svg, false, () => {
                    l2Log('[L2 MAC Engine] Frame ricevuto su porta Gi0/1 (VLAN 10). Tag 802.1Q inserito.');
                    
                    const cam = document.getElementById('l2-cam-table');
                    if (cam) cam.classList.add('l2-cam-searching');

                    setTimeout(() => {
                        l2Log('[L2 MAC Engine] Source MAC (00:AA:11:BB:22:33) appreso nella CAM Table.');
                        l2Log('[L2 Forwarding] Destinazione Broadcast (FF:FF:FF:FF:FF:FF). Flooding confinato a VLAN 10.');
                        
                        setTimeout(() => {
                            l2Log('[Sicurezza 802.1Q] Switch configurato. Traffico segmentato correttamente. Broadcast contenuto nella VLAN 10. Sistemi POS isolati e al sicuro.', 'warn');
                            
                            // Pulse Orange copies ONLY to Tablet Guest 2
                            l2AnimatePulse('l2-cable-tab-sw', '#ffaa00', 900, svg, true, () => {
                                l2ActivateNode('l2-tablet');
                                l2Log('[Tablet Guest 2] Ricezione Broadcast frame da Smartphone Guest 1.');
                                l2Log('[L2 Switching] Commutazione completata. Dominio di collisione protetto.');
                                btnBroadcast.disabled = false;
                                btnUnicast.disabled = false;
                            });
                        }, 600);
                    }, 800);
                });
            }, 300);
        } else {
            // --- UNCONFIGURED FLAT SCENARIO ---
            l2Log('[L2 MAC Engine] Smartphone Guest 1 prepara un frame Broadcast (VLAN 1 - Rete Piatta).');
            setTimeout(() => {
                l2ActivateNode('l2-smartphone');
                // Pulse Red from smartphone to switch
                l2AnimatePulse('l2-cable-smart-sw', '#ef5350', 900, svg, false, () => {
                    l2Log('[L2 MAC Engine] Frame ricevuto su porta Gi0/1 (Nessuna VLAN configurata).');
                    
                    const cam = document.getElementById('l2-cam-table');
                    if (cam) cam.classList.add('l2-cam-searching');

                    setTimeout(() => {
                        l2Log('[L2 MAC Engine] Source MAC (00:AA:11:BB:22:33) appreso nella CAM Table.');
                        l2Log('[L2 Forwarding] Destinazione Broadcast (FF:FF:FF:FF:FF:FF). Inizio Flooding totale su tutte le porte della LAN...');
                        
                        setTimeout(() => {
                            l2Log('[ATTENZIONE] Rete Piatta. Il dominio di broadcast è unico. Traffico passeggeri intercettabile dai dispositivi di cassa. Grave rischio di sicurezza.', 'warn');
                            
                            // Red Pulse flooded to ALL other nodes in parallel
                            let completed = 0;
                            const checkComplete = () => {
                                completed++;
                                if (completed === 3) {
                                    l2Log('[L2 Switching] Flooding completato. La rete intera è stata inondata.');
                                    btnBroadcast.disabled = false;
                                    btnUnicast.disabled = false;
                                }
                            };

                            l2AnimatePulse('l2-cable-tab-sw', '#ef5350', 900, svg, true, () => {
                                l2ActivateNode('l2-tablet');
                                l2Log('[Tablet Guest 2] Frame ricevuto.');
                                checkComplete();
                            });
                            l2AnimatePulse('l2-cable-sw-pos1', '#ef5350', 900, svg, false, () => {
                                l2ActivateNode('l2-pos1');
                                l2Log('[POS Bar 1] Frame ricevuto! (Vulnerabilità: Il POS riceve traffico Guest).', 'warn');
                                checkComplete();
                            });
                            l2AnimatePulse('l2-cable-sw-pos2', '#ef5350', 900, svg, false, () => {
                                l2ActivateNode('l2-pos2');
                                l2Log('[POS Bar 2] Frame ricevuto! (Vulnerabilità: Il POS riceve traffico Guest).', 'warn');
                                checkComplete();
                            });
                        }, 600);
                    }, 800);
                });
            }, 300);
        }
    });

    // POS 1 to POS 2 Transaction Action
    btnUnicast.addEventListener('click', () => {
        btnBroadcast.disabled = true;
        btnUnicast.disabled = true;
        l2Logs.innerHTML = '';
        resetL2Elements();

        const svg = document.getElementById('l2-svg-canvas');
        const isConfigured = vlanToggle.checked;

        if (isConfigured) {
            // --- CONFIGURED VLAN SCENARIO ---
            l2Log('[L2 MAC Engine] POS Bar 1 prepara una transazione Unicast (VLAN 40).');
            setTimeout(() => {
                l2ActivateNode('l2-pos1');
                // Cyan pulse from POS 1 to Switch (reverse)
                l2AnimatePulse('l2-cable-sw-pos1', '#00d2ff', 900, svg, true, () => {
                    l2Log('[L2 MAC Engine] Frame ricevuto su porta Gi0/5 (VLAN 40). Tag 802.1Q... OK.');
                    
                    const cam = document.getElementById('l2-cam-table');
                    if (cam) cam.classList.add('l2-cam-searching');

                    setTimeout(() => {
                        l2Log('[L2 MAC Engine] Source MAC (00:FF:99:88:77:66) appreso nella CAM Table.');
                        l2Log('[L2 Forwarding] Destinazione Unicast (MAC 00:FF:99:88:77:55 - Noto su Gi0/6).');
                        
                        setTimeout(() => {
                            l2Log('[L2 Forwarding] Inoltro Unicast all\'interno della VLAN 40. Dati di pagamento protetti.', 'warn');
                            
                            // Cyan pulse directly to POS 2 (normal)
                            l2AnimatePulse('l2-cable-sw-pos2', '#00d2ff', 900, svg, false, () => {
                                l2ActivateNode('l2-pos2');
                                l2Log('[POS Bar 2] Transazione completata con successo. RTT < 0.1ms.');
                                btnBroadcast.disabled = false;
                                btnUnicast.disabled = false;
                            });
                        }, 600);
                    }, 800);
                });
            }, 300);
        } else {
            // --- UNCONFIGURED FLAT SCENARIO ---
            l2Log('[L2 MAC Engine] POS Bar 1 prepara una transazione Unicast (VLAN 1 - Rete Piatta).');
            setTimeout(() => {
                l2ActivateNode('l2-pos1');
                // Red pulse representing vulnerable unicast from POS 1 to Switch (reverse)
                l2AnimatePulse('l2-cable-sw-pos1', '#ef5350', 900, svg, true, () => {
                    l2Log('[L2 MAC Engine] Frame ricevuto su porta Gi0/5 (default VLAN 1).');
                    
                    const cam = document.getElementById('l2-cam-table');
                    if (cam) cam.classList.add('l2-cam-searching');

                    setTimeout(() => {
                        l2Log('[L2 MAC Engine] Source MAC appreso nella CAM Table.');
                        l2Log('[L2 Forwarding] Destinazione Unicast (MAC 00:FF:99:88:77:55 - Noto su Gi0/6).');
                        
                        setTimeout(() => {
                            l2Log('[ATTENZIONE] Rete Piatta. Sebbene l\'inoltro sia Unicast, la mancanza di segmentazione 802.1Q permette ARP Spoofing/Poisoning da parte di malware sulla rete Guest.', 'warn');
                            
                            // Red pulse to POS 2 (normal)
                            l2AnimatePulse('l2-cable-sw-pos2', '#ef5350', 900, svg, false, () => {
                                l2ActivateNode('l2-pos2');
                                l2Log('[POS Bar 2] Transazione ricevuta. (ATTENZIONE: Dati di pagamento esposti a sniffing laterale).', 'warn');
                                btnBroadcast.disabled = false;
                                btnUnicast.disabled = false;
                            });
                        }, 600);
                    }, 800);
                });
            }, 300);
        }
    });

    // ==========================================
    // EXTRA SANDBOX: NOC GLOBAL NETWORK PLAYGROUND
    // ==========================================
    const sbIspFiber = document.getElementById('sb-isp-fiber');
    const sbIspGpon = document.getElementById('sb-isp-gpon');
    const sbSdwanPolicy = document.getElementById('sb-sdwan-policy');
    const sbVlanIso = document.getElementById('sb-vlan-iso');
    const sbVpnStatus = document.getElementById('sb-vpn-status');
    const sbFwInspect = document.getElementById('sb-fw-inspect');
    
    const sbTermLogs = document.getElementById('sb-term-logs');
    const sbCmdInput = document.getElementById('sb-cmd-input');
    const sbSvgCanvas = document.getElementById('sb-svg-canvas');
    const sbSelectionWarning = document.getElementById('sb-selection-warning');
    const sbTermInputLine = document.getElementById('sb-term-input-line');
    const sbTermPrompt = document.getElementById('sb-term-prompt');
    const sbAvailableCommands = document.getElementById('sb-available-commands');

    let activeNodeId = null;

    // Device Specifications
    const deviceConfigs = {
        'sb-node-client-hq': {
            prompt: 'venezia-client-pc$ ',
            name: 'Venezia-PC-Client',
            commands: ['ping 10.0.2.100', 'ping 10.0.3.50', 'ping 10.0.4.99', 'ifconfig', 'traceroute 10.0.3.50', 'help', 'clear']
        },
        'sb-node-server-hq': {
            prompt: 'venezia-server-nas$ ',
            name: 'Venezia-Server-NAS',
            commands: ['systemctl status backuppd', 'df -h', 'help', 'clear']
        },
        'sb-node-core-hq': {
            prompt: 'Venezia-Core-L3# ',
            name: 'Venezia-Core-L3',
            commands: ['show vlan', 'show mac address-table', 'show interfaces status', 'help', 'clear']
        },
        'sb-node-fw-hq': {
            prompt: 'Venezia-Edge-FW# ',
            name: 'Venezia-Edge-FW',
            commands: ['show sdwan route', 'show sdwan tunnels', 'show firewall policy', 'help', 'clear']
        },
        'sb-node-isp-cloud': {
            prompt: 'ISP-WAN-Transit> ',
            name: 'ISP-WAN-Cloud',
            commands: ['show ip route', 'show bgp summary', 'help', 'clear']
        },
        'sb-node-fw-rv': {
            prompt: 'Ravenna-Edge-FW# ',
            name: 'Ravenna-Edge-FW',
            commands: ['show sdwan tunnels', 'show ipsec sa', 'help', 'clear']
        },
        'sb-node-core-rv': {
            prompt: 'Ravenna-Switch# ',
            name: 'Ravenna-Switch',
            commands: ['show vlan', 'show mac address-table', 'help', 'clear']
        },
        'sb-node-client-rv': {
            prompt: 'ravenna-client-pc$ ',
            name: 'Ravenna-Client',
            commands: ['ping 10.0.2.50', 'ifconfig', 'help', 'clear']
        },
        'sb-node-server-rv': {
            prompt: 'ravenna-server-nas$ ',
            name: 'Ravenna-Server',
            commands: ['df -h', 'help', 'clear']
        }
    };

    // Live indicators update
    function updateSbIndicators() {
        const fiberUp = sbIspFiber ? sbIspFiber.checked : false;
        const gponUp = sbIspGpon ? sbIspGpon.checked : false;
        const vpnUp = sbVpnStatus ? sbVpnStatus.checked : false;
        
        const lineFiber = document.getElementById('sb-line-fiber');
        const lineGpon = document.getElementById('sb-line-gpon');
        const lineVpn = document.getElementById('sb-line-vpn-expanded');

        if (lineFiber) lineFiber.setAttribute('stroke', fiberUp ? '#ff4444' : '#1f242c');
        if (lineGpon) lineGpon.setAttribute('stroke', gponUp ? '#27c93f' : '#1f242c');
        if (lineVpn) {
            lineVpn.setAttribute('stroke', (vpnUp && (fiberUp || gponUp)) ? '#ab47bc' : '#1f242c');
            lineVpn.style.filter = (vpnUp && (fiberUp || gponUp)) ? 'drop-shadow(0 0 5px #ab47bc)' : 'none';
        }

        // Live LEDs next to devices
        const ledIsp = document.getElementById('sb-status-dot-isp-cloud');
        if (ledIsp) ledIsp.setAttribute('fill', (fiberUp || gponUp) ? '#27c93f' : '#ef5350');

        const ledFwHq = document.getElementById('sb-status-dot-fw-hq');
        if (ledFwHq) ledFwHq.setAttribute('fill', (fiberUp || gponUp) ? '#27c93f' : '#ffaa00');

        const ledFwRv = document.getElementById('sb-status-dot-fw-rv');
        if (ledFwRv) ledFwRv.setAttribute('fill', (vpnUp && (fiberUp || gponUp)) ? '#27c93f' : '#ef5350');
    }

    if (sbIspFiber) sbIspFiber.addEventListener('change', updateSbIndicators);
    if (sbIspGpon) sbIspGpon.addEventListener('change', updateSbIndicators);
    if (sbVpnStatus) sbVpnStatus.addEventListener('change', updateSbIndicators);

    updateSbIndicators();

    // Formatted timestamp
    function getTimestamp() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `[${hrs}:${mins}:${secs}.${ms}]`;
    }

    // Write to terminal
    function sbLog(text, type = 'info') {
        if (!sbTermLogs) return;
        const div = document.createElement('div');
        div.style.marginBottom = '4px';
        div.style.whiteSpace = 'pre-wrap';
        div.style.fontFamily = 'var(--font-mono)';
        const stamp = `<span style="color: #6a737d; margin-right: 8px;">${getTimestamp()}</span>`;

        if (type === 'warn') {
            div.style.color = '#ef5350';
            div.style.fontWeight = 'bold';
        } else if (type === 'success') {
            div.style.color = '#27c93f';
        } else if (type === 'accent') {
            div.style.color = '#00d2ff';
        } else if (type === 'info-gray') {
            div.style.color = '#8b949e';
        } else {
            div.style.color = '#c9d1d9';
        }
        div.innerHTML = stamp + text;
        sbTermLogs.appendChild(div);
        sbTermLogs.scrollTop = sbTermLogs.scrollHeight;
    }

    // Live HUD Overlay selectors
    const sbHudOverlay = document.getElementById('sb-hud-overlay');
    const sbHudText = document.getElementById('sb-hud-text');

    function showSbHud(text, duration = 0) {
        if (!sbHudOverlay || !sbHudText) return;
        sbHudText.innerHTML = text;
        sbHudOverlay.style.display = 'flex';
        // force a reflow
        sbHudOverlay.offsetHeight;
        sbHudOverlay.style.opacity = '1';
        sbHudOverlay.style.transform = 'translateX(-50%) scale(1)';

        if (duration > 0) {
            setTimeout(hideSbHud, duration);
        }
    }

    function hideSbHud() {
        if (!sbHudOverlay) return;
        sbHudOverlay.style.opacity = '0';
        sbHudOverlay.style.transform = 'translateX(-50%) scale(0.9)';
        setTimeout(() => {
            sbHudOverlay.style.display = 'none';
        }, 300);
    }

    // SVG Pulse Animation with glowing path link highlighting
    function sbAnimatePulse(pathId, color, duration = 800, isReverse = false) {
        return new Promise((resolve) => {
            const path = document.getElementById(pathId);
            if (!path || !sbSvgCanvas) {
                resolve();
                return;
            }

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', '8');
            circle.setAttribute('fill', color);
            circle.setAttribute('filter', 'url(#sb-glow)');
            sbSvgCanvas.appendChild(circle);

            // Save original stroke settings to restore them afterwards
            const originalStroke = path.getAttribute('stroke');
            const originalWidth = path.getAttribute('stroke-width');
            
            // Add custom active glows
            path.style.transition = 'stroke 0.2s, stroke-width 0.2s, filter 0.2s';
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', '4.5');
            path.style.filter = `drop-shadow(0 0 6px ${color})`;

            const pathLength = path.getTotalLength();
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;

                if (progress < 1) {
                    const currentLength = isReverse ? pathLength * (1 - progress) : pathLength * progress;
                    const point = path.getPointAtLength(currentLength);
                    circle.setAttribute('cx', point.x);
                    circle.setAttribute('cy', point.y);
                    requestAnimationFrame(step);
                } else {
                    circle.remove();
                    // Restore original link styles smoothly
                    path.style.transition = 'stroke 0.6s ease, stroke-width 0.6s ease, filter 0.6s ease';
                    path.setAttribute('stroke', originalStroke);
                    path.setAttribute('stroke-width', originalWidth);
                    path.style.filter = 'none';
                    resolve();
                }
            }
            requestAnimationFrame(step);
        });
    }

    // Activate Node Glow
    function sbActivateNode(nodeId) {
        const node = document.getElementById(nodeId);
        if (node) {
            node.classList.add('pulse-active');
            setTimeout(() => node.classList.remove('pulse-active'), 1000);
        }
    }

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Device Click/Selection Handler
    function selectDevice(nodeId) {
        // Reset active stylings
        document.querySelectorAll('.viz-node').forEach(node => {
            node.classList.remove('selected-node');
        });

        const targetNode = document.getElementById(nodeId);
        if (!targetNode || !deviceConfigs[nodeId]) return;

        activeNodeId = nodeId;
        targetNode.classList.add('selected-node');

        // Hide warning and reveal terminal prompt
        if (sbSelectionWarning) sbSelectionWarning.style.display = 'none';
        if (sbTermInputLine) sbTermInputLine.style.display = 'flex';

        const config = deviceConfigs[nodeId];
        if (sbTermPrompt) sbTermPrompt.textContent = config.prompt;

        // Render available commands buttons
        if (sbAvailableCommands) {
            sbAvailableCommands.innerHTML = '';
            config.commands.forEach(cmd => {
                const btn = document.createElement('button');
                btn.className = 'trace-btn sb-cmd-btn';
                btn.textContent = cmd;
                btn.style.margin = '2px';
                btn.style.fontSize = '0.75rem';
                btn.style.padding = '4px 8px';
                
                // Color preset buttons beautifully based on command type
                if (cmd.startsWith('ping') || cmd.startsWith('traceroute')) {
                    btn.style.background = 'rgba(0, 210, 255, 0.1)';
                    btn.style.borderColor = '#00d2ff';
                    btn.style.color = '#00d2ff';
                } else if (cmd.startsWith('show')) {
                    btn.style.background = 'rgba(171, 71, 188, 0.1)';
                    btn.style.borderColor = '#ab47bc';
                    btn.style.color = '#ab47bc';
                } else {
                    btn.style.background = 'rgba(107, 130, 158, 0.15)';
                    btn.style.borderColor = '#6b829e';
                    btn.style.color = '#6b829e';
                }

                btn.addEventListener('click', () => {
                    if (sbCmdInput) {
                        sbCmdInput.value = cmd;
                        handleCommandSubmit();
                    }
                });
                sbAvailableCommands.appendChild(btn);
            });
        }

        sbLog(`[CLI] Stabilita sessione console con apparato: <strong style="color:#00d2ff;">${config.name}</strong>. Pronto per l'inserimento comandi.`, 'success');
    }

    // Attach click events and hover animations on SVG nodes
    const cableAdjacency = {
        'sb-node-client-hq': ['sb-line-core-v10'],
        'sb-node-server-hq': ['sb-line-core-v20'],
        'sb-node-core-hq': ['sb-line-core-v10', 'sb-line-core-v20', 'sb-line-fw-core'],
        'sb-node-fw-hq': ['sb-line-fw-core', 'sb-line-fiber', 'sb-line-gpon', 'sb-line-vpn-expanded'],
        'sb-node-isp-cloud': ['sb-line-fiber', 'sb-line-gpon', 'sb-line-vpn-expanded'],
        'sb-node-fw-rv': ['sb-line-fiber', 'sb-line-gpon', 'sb-line-vpn-expanded', 'sb-line-fw-core-rv'],
        'sb-node-core-rv': ['sb-line-fw-core-rv', 'sb-line-core-v10-rv', 'sb-line-core-v20-rv'],
        'sb-node-client-rv': ['sb-line-core-v10-rv'],
        'sb-node-server-rv': ['sb-line-core-v20-rv']
    };

    Object.keys(deviceConfigs).forEach(nodeId => {
        const element = document.getElementById(nodeId);
        if (element) {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                selectDevice(nodeId);
            });
            
            element.addEventListener('mouseenter', () => {
                const adjCables = cableAdjacency[nodeId] || [];
                adjCables.forEach(cableId => {
                    const cable = document.getElementById(cableId);
                    if (cable) {
                        cable.classList.add('cable-hover');
                    }
                });
            });

            element.addEventListener('mouseleave', () => {
                const adjCables = cableAdjacency[nodeId] || [];
                adjCables.forEach(cableId => {
                    const cable = document.getElementById(cableId);
                    if (cable) {
                        cable.classList.remove('cable-hover');
                    }
                });
            });
        }
    });

    // Handle command typing and submission
    if (sbCmdInput) {
        sbCmdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleCommandSubmit();
            }
        });
    }

    async function handleCommandSubmit() {
        if (!sbCmdInput || !activeNodeId) return;
        const cmdRaw = sbCmdInput.value.trim();
        sbCmdInput.value = '';
        if (!cmdRaw) return;

        const config = deviceConfigs[activeNodeId];
        sbLog(`<strong>${config.prompt}${cmdRaw}</strong>`, 'accent');

        const cmdParts = cmdRaw.split(' ');
        const baseCmd = cmdParts[0].toLowerCase();
        const arg = cmdParts[1];

        // Disable interactive elements during flow execution
        const buttons = sbAvailableCommands.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
        sbCmdInput.disabled = true;

        await wait(300);

        try {
            if (baseCmd === 'clear') {
                if (sbTermLogs) sbTermLogs.innerHTML = '';
            } else if (baseCmd === 'help') {
                sbLog(`Comandi disponibili per ${config.name}:\n` + config.commands.map(c => `  - ${c}`).join('\n'), 'info-gray');
            } else if (activeNodeId === 'sb-node-client-hq') {
                // HQ PC commands execution
                if (cmdRaw === 'ifconfig') {
                    sbLog(`eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.2.50  netmask 255.255.255.0  broadcast 10.0.2.255
        ether 00:aa:11:bb:22:33  txqueuelen 1000  (Ethernet)
        RX packets 142058  bytes 18459203 (18.4 MB)
        TX packets 98452  bytes 12845601 (12.8 MB)
vlan10: flags=4163<UP,BROADCAST,RUNNING>  mtu 1500
        inet 10.0.2.50  netmask 255.255.255.0
        device eth0  association VLAN 10 (HQ-Client-LAN)`);
                } else if (cmdRaw === 'ping 10.0.2.100') {
                    sbLog('[CLIENT] Inizializzazione frame ICMP Echo Request. Destinazione: Server HQ NAS (10.0.2.100)...');
                    showSbHud("<strong>[1/4]</strong> Invio Echo Request sulla LAN locale (VLAN 10) al Core Switch...");
                    await wait(800);

                    sbActivateNode('sb-node-client-hq');
                    await sbAnimatePulse('sb-line-core-v10', '#ffaa00', 800, false);

                    sbActivateNode('sb-node-core-hq');
                    sbLog('[CORE-SWITCH-HQ] Frame ricevuto su porta Gi0/10. MAC appreso. Inoltro a VLAN 20...');
                    showSbHud("<strong>[2/4]</strong> Core Switch commuta il traffico su VLAN 20 verso il Server NAS...");
                    await sbAnimatePulse('sb-line-core-v20', '#00d2ff', 800, false);

                    sbActivateNode('sb-node-server-hq');
                    sbLog('[SERVER-10.0.2.100] Richiesta ricevuta. Risposta Echo Reply spedita.', 'success');
                    showSbHud("<strong>[3/4]</strong> Server NAS (10.0.2.100) risponde inviando l'Echo Reply di ritorno...");
                    
                    await sbAnimatePulse('sb-line-core-v20', '#00d2ff', 800, true);
                    sbActivateNode('sb-node-core-hq');
                    await sbAnimatePulse('sb-line-core-v10', '#ffaa00', 800, true);
                    sbActivateNode('sb-node-client-hq');

                    showSbHud("<strong>[4/4]</strong> Connettività LAN OK! RTT < 0.2ms", 3000);
                    sbLog(`64 bytes from 10.0.2.100: icmp_seq=1 ttl=64 time=0.155 ms
64 bytes from 10.0.2.100: icmp_seq=2 ttl=64 time=0.148 ms

--- 10.0.2.100 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1008ms`, 'success');

                } else if (cmdRaw === 'ping 10.0.3.50') {
                    const fiberUp = sbIspFiber ? sbIspFiber.checked : false;
                    const gponUp = sbIspGpon ? sbIspGpon.checked : false;
                    const vpnUp = sbVpnStatus ? sbVpnStatus.checked : false;
                    const sdwanPolicy = sbSdwanPolicy ? sbSdwanPolicy.value : 'balanced';

                    sbLog('[CLIENT] Avvio ping geografico verso Client Ravenna (10.0.3.50)...');
                    showSbHud("<strong>[1/8]</strong> Avvio ping verso sede remota Ravenna (10.0.3.50)...");
                    await wait(800);

                    sbActivateNode('sb-node-client-hq');
                    showSbHud("<strong>[2/8]</strong> Client HQ invia pacchetto al Core Switch...");
                    await sbAnimatePulse('sb-line-core-v10', '#ffaa00', 800, false);

                    sbActivateNode('sb-node-core-hq');
                    sbLog('[CORE-SWITCH-HQ] Subnet non locale. Default gateway: SD-WAN Edge HQ (10.0.1.1). Inoltro...');
                    showSbHud("<strong>[3/8]</strong> Subnet esterna: Core Switch inoltra a Edge NGFW HQ...");
                    await sbAnimatePulse('sb-line-fw-core', '#00d2ff', 600, false);

                    sbActivateNode('sb-node-fw-hq');
                    await wait(800);

                    if (!fiberUp && !gponUp) {
                        showSbHud("<strong style='color:#ef5350;'>[KO WAN]</strong> Connessione fallita: nessun link fisico WAN attivo!", 4000);
                        sbLog('[SD-WAN-EDGE-HQ] ERRORE: Nessun uplink fisico WAN attivo! Fibra e GPON disabilitati.', 'warn');
                        sbLog('ping: sendto: Network is unreachable', 'warn');
                        return;
                    }
                    if (!vpnUp) {
                        showSbHud("<strong style='color:#ef5350;'>[KO VPN]</strong> Connessione fallita: Tunnel VPN IPsec disattivato!", 4000);
                        sbLog('[SD-WAN-EDGE-HQ] ERRORE: Sessione VPN IPsec Overlay disattivata (VPN Down). Pacchetto scartato.', 'warn');
                        sbLog('Request timeout for icmp_seq 1', 'warn');
                        return;
                    }

                    // Choose link
                    let activePath = 'sb-line-fiber';
                    let color = '#ff4444';
                    let pathName = 'Fibra Primaria Dedicata';

                    if (sdwanPolicy === 'failover-gpon') {
                        if (fiberUp) {
                            activePath = 'sb-line-fiber';
                            color = '#ff4444';
                            pathName = 'Fibra Primaria';
                        } else {
                            sbLog('[SD-WAN-EDGE-HQ] Failover innescato. Linea Fibra interrotta. Inoltro su GPON.', 'warn');
                            activePath = 'sb-line-gpon';
                            color = '#27c93f';
                            pathName = 'GPON Failover';
                        }
                    } else if (sdwanPolicy === 'priority-fiber') {
                        if (fiberUp) {
                            activePath = 'sb-line-fiber';
                            color = '#ff4444';
                            pathName = 'Fibra Dedicata';
                        } else {
                            activePath = 'sb-line-gpon';
                            color = '#27c93f';
                            pathName = 'GPON Backup';
                        }
                    } else { // balanced
                        if (fiberUp && gponUp) {
                            activePath = Math.random() > 0.5 ? 'sb-line-fiber' : 'sb-line-gpon';
                            color = activePath === 'sb-line-fiber' ? '#ff4444' : '#27c93f';
                            pathName = activePath === 'sb-line-fiber' ? 'Balanced (Fibra)' : 'Balanced (GPON)';
                        } else if (fiberUp) {
                            activePath = 'sb-line-fiber';
                            color = '#ff4444';
                            pathName = 'Fibra';
                        } else {
                            activePath = 'sb-line-gpon';
                            color = '#27c93f';
                            pathName = 'GPON';
                        }
                    }

                    sbLog(`[SD-WAN-EDGE-HQ] Instradamento intelligente su: ${pathName}. Cifratura IPSec in corso.`);
                    showSbHud("<strong>[4/8]</strong> Algoritmo SD-WAN: instradamento su <strong>" + pathName + "</strong>...");
                    await sbAnimatePulse(activePath, color, 800, false);

                    sbActivateNode('sb-node-isp-cloud');
                    sbLog('[WAN-TRANSIT] Pacchetto incapsulato ESP in transito.');
                    showSbHud("<strong>[5/8]</strong> Transito geografico del tunnel IPsec virtuale cifrato...");
                    await sbAnimatePulse('sb-line-vpn-expanded', '#ab47bc', 900, false);

                    sbActivateNode('sb-node-fw-rv');
                    sbLog('[EDGE-RAVENNA] Decapsulamento VPN avvenuto con successo. Inoltro allo switch locale.');
                    showSbHud("<strong>[6/8]</strong> Edge Ravenna riceve e decifra il pacchetto ESP...");
                    await sbAnimatePulse('sb-line-fw-core-rv', '#6b829e', 600, false);

                    sbActivateNode('sb-node-core-rv');
                    showSbHud("<strong>[7/8]</strong> Lo switch di Ravenna immette il frame sulla VLAN 10 locale...");
                    await sbAnimatePulse('sb-line-core-v10-rv', '#ffaa00', 800, false);

                    sbActivateNode('sb-node-client-rv');
                    sbLog('[CLIENT-RAVENNA] Echo Request elaborato. Invio Echo Reply...', 'success');
                    showSbHud("<strong>[8/8]</strong> Client Spoke raggiunto! Connettività geografica stabilita!", 3000);
                    
                    await sbAnimatePulse('sb-line-core-v10-rv', '#ffaa00', 800, true);
                    sbActivateNode('sb-node-core-rv');
                    await sbAnimatePulse('sb-line-fw-core-rv', '#6b829e', 600, true);
                    sbActivateNode('sb-node-fw-rv');
                    await sbAnimatePulse('sb-line-vpn-expanded', '#ab47bc', 900, true);
                    sbActivateNode('sb-node-fw-hq');
                    await sbAnimatePulse('sb-line-fw-core', '#00d2ff', 600, true);
                    sbActivateNode('sb-node-core-hq');
                    await sbAnimatePulse('sb-line-core-v10', '#ffaa00', 800, true);
                    sbActivateNode('sb-node-client-hq');

                    sbLog(`64 bytes from 10.0.3.50: icmp_seq=1 ttl=56 time=24.1 ms
64 bytes from 10.0.3.50: icmp_seq=2 ttl=56 time=23.7 ms

--- 10.0.3.50 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, RTT avg = 23.9 ms`, 'success');

                } else if (cmdRaw === 'ping 10.0.4.99') {
                    const vlanIsolated = sbVlanIso ? sbVlanIso.checked : false;
                    const fwInspect = sbFwInspect ? sbFwInspect.value : 'strict';

                    sbLog('[CLIENT] Inizio connessione inter-VLAN verso Terminale POS (10.0.4.99)...');
                    showSbHud("<strong>[1/4]</strong> Client tenta connessione inter-VLAN verso terminale POS (10.0.4.99)...");
                    await wait(800);

                    sbActivateNode('sb-node-client-hq');
                    await sbAnimatePulse('sb-line-core-v10', '#ffaa00', 800, false);

                    sbActivateNode('sb-node-core-hq');
                    
                    if (vlanIsolated) {
                        sbLog('[CORE-SWITCH-HQ] Accesso a VLAN 40 non autorizzato direttamente. Re-routing obbligatorio al NGFW per ispezione...');
                        showSbHud("<strong>[2/4]</strong> Segmentazione attiva: Core Switch devia il traffico al NGFW per ispezione...");
                        await sbAnimatePulse('sb-line-fw-core', '#00d2ff', 600, false);
                        
                        sbActivateNode('sb-node-fw-hq');
                        await wait(1000);

                        if (fwInspect === 'strict') {
                            showSbHud("<strong style='color:#ef5350;'>[BLOCCO NGFW]</strong> Zero-Trust Enforced: Traffico da Client a POS NEGATO!", 4000);
                            sbLog('[SD-WAN-EDGE-HQ] Zero-Trust Enforced: Tentativo non autorizzato da Client (VLAN 10) a POS (VLAN 40). BLOCK POLICY MATCH.', 'warn');
                            sbLog('ping: sendto: Permission denied (NGFW Block)', 'warn');
                            return;
                        } else {
                            showSbHud("<strong style='color:#27c93f;'>[NGFW BYPASS]</strong> NGFW in modalità Permissiva: pacchetto registrato e inoltrato!", 3000);
                            sbLog('[SD-WAN-EDGE-HQ] NGFW in modalità Permissiva. Generazione log di sicurezza e autorizzazione transitoria.', 'success');
                            await sbAnimatePulse('sb-line-fw-core', '#27c93f', 600, true);
                            
                            sbActivateNode('sb-node-core-hq');
                            sbLog('[CORE-SWITCH-HQ] Inoltro frame verso terminale POS...');
                            await wait(600);
                            sbLog('64 bytes from 10.0.4.99: icmp_seq=1 ttl=64 time=1.42 ms', 'success');
                        }
                    } else {
                        showSbHud("<strong style='color:#27c93f;'>[BYPASS]</strong> Segmentazione disattivata: Switch inoltra direttamente...", 3000);
                        sbLog('[CORE-SWITCH-HQ] Segmentazione spenta. Inoltro directo a VLAN 40...');
                        await wait(800);
                        sbLog('64 bytes from 10.0.4.99: icmp_seq=1 ttl=64 time=0.88 ms', 'success');
                    }

                } else if (cmdRaw === 'traceroute 10.0.3.50') {
                    sbLog(`traceroute to 10.0.3.50 (10.0.3.50), 30 hops max, 60 byte packets
 1  10.0.2.1 (Venezia-Core-L3)  0.215 ms
 2  10.0.1.1 (Venezia-Edge-FW)  0.410 ms
 3  185.22.45.99 (ISP-WAN-Transit)  12.35 ms
 4  10.0.3.1 (Ravenna-Edge-FW)  22.10 ms
 5  10.0.3.50 (Ravenna-Client)  24.05 ms`);
                } else {
                    sbLog(`Command not recognized: ${cmdRaw}. Type 'help' to see valid inputs.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-server-hq') {
                // HQ Server
                if (cmdRaw === 'systemctl status backuppd') {
                    sbLog(`● backuppd.service - NOC Immutable Backup Daemon
   Loaded: loaded (/lib/systemd/system/backuppd.service; enabled)
   Active: active (running) since Tue 2026-05-19 08:12:04 CET; 8h ago
 Main PID: 1205 (backuppd)
   CGroup: /system.slice/backuppd.service
           └─1205 /usr/bin/backuppd --pool=immutable-nas01

May 19 08:12:04 Server-NAS backuppd[1205]: Pool immutable-nas01 mounted. Encryption: AES-XTS-256.
May 19 08:12:05 Server-NAS backuppd[1205]: Immutability locks verified. No modifications allowed.
May 19 12:00:00 Server-NAS backuppd[1205]: Replication with Spoke Server completed: 142 GB synced.`, 'success');
                } else if (cmdRaw === 'df -h') {
                    sbLog(`Filesystem            Size  Used Avail Use% Mounted on
/dev/sda1              50G   12G   35G  26% /
/dev/sdb1             5.0T  2.2T  2.8T  44% /mnt/nas-storage
/dev/sdc1 (immutable)  10T  6.2T  3.8T  62% /mnt/immutable-pool`);
                } else {
                    sbLog(`Command not recognized. Type 'help' for options.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-core-hq') {
                // HQ Core
                if (cmdRaw === 'show vlan') {
                    sbLog(`VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
10   VLAN10-Client-HQ                 active    Gi0/1, Gi0/2, Gi0/10
20   VLAN20-Server-HQ                 active    Gi0/5, Gi0/6, Gi0/24
40   VLAN40-POS-Terminal              active    Gi0/12
99   Management-VLAN                  active    Gi0/48`);
                } else if (cmdRaw === 'show mac address-table') {
                    sbLog(`          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
  10    00:aa:11:bb:22:33 DYNAMIC     Gi0/10
  20    00:aa:11:cc:33:44 DYNAMIC     Gi0/24`);
                } else if (cmdRaw === 'show interfaces status') {
                    sbLog(`Port      Name               Status       Vlan       Duplex  Speed Type
Gi0/1     Uplink to FW       connected    trunk      full    1000  1000BaseTX
Gi0/10    Venezia-PC-Client  connected    10         full    1000  1000BaseTX
Gi0/24    Venezia-Server-NAS connected    20         full    1000  1000BaseTX`);
                } else {
                    sbLog(`Command not recognized. Type 'help' for options.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-fw-hq') {
                // HQ Edge FW
                const fiberUp = sbIspFiber ? sbIspFiber.checked : false;
                const gponUp = sbIspGpon ? sbIspGpon.checked : false;
                const vpnUp = sbVpnStatus ? sbVpnStatus.checked : false;
                const inspect = sbFwInspect ? sbFwInspect.value : 'strict';

                if (cmdRaw === 'show sdwan route') {
                    sbLog(`SD-WAN Route Table (BFD Metrics Verified):
Prefix        Nexthop       Interface     State    RTT     Jitter  Loss
------------  ------------  ------------  -------  ------  ------  ----
10.0.3.0/24   10.254.1.2    tun0-fiber    ${fiberUp ? 'ACTIVE ' : 'DOWN   '}  24ms    1.2ms   0.0%
10.0.3.0/24   10.254.2.2    tun1-gpon     ${gponUp ? 'ACTIVE ' : 'DOWN   '}  38ms    4.8ms   0.1%`);
                } else if (cmdRaw === 'show sdwan tunnels') {
                    sbLog(`SD-WAN Active Tunnel Sessions:
Tunnel Name   Protocol  Underlay IP    Overlay IP    BFD State  Weight
------------  --------  -------------  ------------  ---------  ------
TUN-FIBER     IPsec/ESP 185.44.12.10   10.254.1.1    ${(vpnUp && fiberUp) ? 'UP       ' : 'DOWN     '} 100
TUN-GPON      IPsec/ESP 212.88.99.14   10.254.2.1    ${(vpnUp && gponUp) ? 'UP       ' : 'DOWN     '} 50`);
                } else if (cmdRaw === 'show firewall policy') {
                    sbLog(`Firewall Security Policies:
ID   Source       Destination  Service   Action   Inspection
---  -----------  -----------  --------  -------  ----------------------
101  VLAN10       VLAN20       ANY       PERMIT   L4 Stateful Inspection
102  VLAN10       VLAN40       ANY       ${inspect === 'strict' ? 'DENY   ' : 'PERMIT '} ${inspect === 'strict' ? 'Zero-Trust Block' : 'Permissive Log '}`);
                } else {
                    sbLog(`Command not recognized.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-isp-cloud') {
                // WAN Cloud
                const fiberUp = sbIspFiber ? sbIspFiber.checked : false;
                const gponUp = sbIspGpon ? sbIspGpon.checked : false;

                if (cmdRaw === 'show ip route') {
                    sbLog(`BGP Routing Table - Transit VRF:
Gateway of last resort is not set

  8.8.8.0/24 [20/0] via Public-Gate, 04:12:55
  185.44.12.0/24 [200/0] via HQ-Fiber-Gate, ${fiberUp ? 'connected' : 'DOWN'}
  212.88.99.0/24 [200/0] via HQ-GPON-Gate, ${gponUp ? 'connected' : 'DOWN'}`);
                } else if (cmdRaw === 'show bgp summary') {
                    sbLog(`BGP router identifier 8.8.8.8, local AS number 65000
BGP table version is 1845, main routing table version 1845

Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
185.44.12.10    4 65001  142058  142012     1845    0    0 04:12:00 ${fiberUp ? 'Established' : 'Active'}
212.88.99.14    4 65001   98452   98410     1845    0    0 04:11:55 ${gponUp ? 'Established' : 'Active'}`);
                } else {
                    sbLog(`Command not recognized.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-fw-rv') {
                // RV FW
                const fiberUp = sbIspFiber ? sbIspFiber.checked : false;
                const gponUp = sbIspGpon ? sbIspGpon.checked : false;
                const vpnUp = sbVpnStatus ? sbVpnStatus.checked : false;

                if (cmdRaw === 'show sdwan tunnels') {
                    sbLog(`SD-WAN Tunnel interfaces (Remote Spoke):
Tunnel Name   Protocol  Underlay IP    Overlay IP    BFD State  Weight
------------  --------  -------------  ------------  ---------  ------
TUN-FIBER     IPsec/ESP 185.44.12.10   10.254.1.2    ${(vpnUp && fiberUp) ? 'UP' : 'DOWN'}      100
TUN-GPON      IPsec/ESP 212.88.99.14   10.254.2.2    ${(vpnUp && gponUp) ? 'UP' : 'DOWN'}      50`);
                } else if (cmdRaw === 'show ipsec sa') {
                    sbLog(`IPSec Security Associations (SAs):
interface: tun0-fiber
    Crypto map tag: sdwan-ipsec-map, seq 10, local addr 185.44.12.20
    IPsec state: ${(vpnUp && fiberUp) ? 'ACTIVE' : 'INACTIVE'}
    Inbound AH/ESP SAS:
      spi: 0x3A2B5C1 (60995009)
      transform: esp-aes-256 esp-sha256-hmac
      inbound bytes: ${vpnUp ? '142059203' : '0'}`);
                } else {
                    sbLog(`Command not recognized.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-core-rv') {
                // RV switch
                if (cmdRaw === 'show vlan') {
                    sbLog(`VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
10   VLAN10-Client-Ravenna            active    Gi0/1, Gi0/4
20   VLAN20-Server-Ravenna            active    Gi0/2, Gi0/8`);
                } else if (cmdRaw === 'show mac address-table') {
                    sbLog(`          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
  10    00:cc:22:dd:33:44 DYNAMIC     Gi0/4
  20    00:cc:22:ee:44:55 DYNAMIC     Gi0/8`);
                } else {
                    sbLog(`Command not recognized.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-client-rv') {
                // RV client
                if (cmdRaw === 'ifconfig') {
                    sbLog(`eth0: flags=4163<UP,BROADCAST,RUNNING>  mtu 1500
        inet 10.0.3.50  netmask 255.255.255.0
        ether 00:cc:22:dd:33:44  (Ethernet)
        device eth0  association VLAN 10 (RV-Client-LAN)`);
                } else if (cmdRaw === 'ping 10.0.2.50') {
                    const fiberUp = sbIspFiber ? sbIspFiber.checked : false;
                    const gponUp = sbIspGpon ? sbIspGpon.checked : false;
                    const vpnUp = sbVpnStatus ? sbVpnStatus.checked : false;

                    sbLog('[CLIENT] Inizializzazione ping verso PC Venezia Client (10.0.2.50)...');
                    showSbHud("<strong>[1/8]</strong> Ravenna Client avvia ping verso la sede centrale di Venezia (10.0.2.50)...");
                    await wait(800);

                    sbActivateNode('sb-node-client-rv');
                    showSbHud("<strong>[2/8]</strong> Client remoto invia il pacchetto allo Switch locale di Ravenna...");
                    await sbAnimatePulse('sb-line-core-v10-rv', '#ffaa00', 800, true);

                    sbActivateNode('sb-node-core-rv');
                    showSbHud("<strong>[3/8]</strong> Lo switch instrada verso il Default Gateway (SD-WAN Edge Ravenna)...");
                    await sbAnimatePulse('sb-line-fw-core-rv', '#6b829e', 600, true);

                    sbActivateNode('sb-node-fw-rv');
                    await wait(800);

                    if (!fiberUp && !gponUp) {
                        showSbHud("<strong style='color:#ef5350;'>[KO WAN]</strong> Connessione fallita: nessun link fisico WAN attivo!", 4000);
                        sbLog('[EDGE-RAVENNA] ERRORE: Assenza di instradamento WAN. Link fisici spenti.', 'warn');
                        sbLog('ping: sendto: Host is down', 'warn');
                        return;
                    }
                    if (!vpnUp) {
                        showSbHud("<strong style='color:#ef5350;'>[KO VPN]</strong> Connessione fallita: Tunnel VPN Overlay disattivato!", 4000);
                        sbLog('[EDGE-RAVENNA] ERRORE: VPN IPsec Overlay disattivata.', 'warn');
                        sbLog('Request timeout for icmp_seq 1', 'warn');
                        return;
                    }

                    sbLog('[EDGE-RAVENNA] Incapsulamento tunnel ed invio su WAN...');
                    showSbHud("<strong>[4/8]</strong> Algoritmo SD-WAN: instradamento su tunnel virtuale cifrato...");
                    await sbAnimatePulse('sb-line-vpn-expanded', '#ab47bc', 900, true);

                    sbActivateNode('sb-node-isp-cloud');
                    showSbHud("<strong>[5/8]</strong> Transito geografico del tunnel IPsec virtuale cifrato su ISP Cloud...");
                    await sbAnimatePulse('sb-line-fiber', '#ff4444', 800, true);

                    sbActivateNode('sb-node-fw-hq');
                    showSbHud("<strong>[6/8]</strong> Edge HQ decifra il pacchetto ESP ed inoltra sulla LAN interna...");
                    await sbAnimatePulse('sb-line-fw-core', '#00d2ff', 600, true);

                    sbActivateNode('sb-node-core-hq');
                    showSbHud("<strong>[7/8]</strong> Core Switch commuta su VLAN 10 verso il Client di Venezia...");
                    await sbAnimatePulse('sb-line-core-v10', '#ffaa00', 800, true);

                    sbActivateNode('sb-node-client-hq');
                    sbLog('[VENEZIA-CLIENT] Echo Request ricevuto ed elaborato.', 'success');
                    showSbHud("<strong>[8/8]</strong> Venezia Client raggiunto! Invio risposta speculare di ritorno...", 2000);

                    // Reply trace
                    await sbAnimatePulse('sb-line-core-v10', '#ffaa00', 800, false);
                    sbActivateNode('sb-node-core-hq');
                    await sbAnimatePulse('sb-line-fw-core', '#00d2ff', 600, false);
                    sbActivateNode('sb-node-fw-hq');
                    await sbAnimatePulse('sb-line-fiber', '#ff4444', 800, false);
                    sbActivateNode('sb-node-isp-cloud');
                    await sbAnimatePulse('sb-line-vpn-expanded', '#ab47bc', 900, false);
                    sbActivateNode('sb-node-fw-rv');
                    await sbAnimatePulse('sb-line-fw-core-rv', '#6b829e', 600, false);
                    sbActivateNode('sb-node-core-rv');
                    await sbAnimatePulse('sb-line-core-v10-rv', '#ffaa00', 800, false);
                    sbActivateNode('sb-node-client-rv');

                    sbLog(`64 bytes from 10.0.2.50: icmp_seq=1 ttl=56 time=24.4 ms
64 bytes from 10.0.2.50: icmp_seq=2 ttl=56 time=24.0 ms

--- 10.0.2.50 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, RTT avg = 24.2 ms`, 'success');
                } else {
                    sbLog(`Command not recognized.`, 'warn');
                }
            } else if (activeNodeId === 'sb-node-server-rv') {
                // RV Server
                if (cmdRaw === 'df -h') {
                    sbLog(`Filesystem            Size  Used Avail Use% Mounted on
/dev/sda1              50G   14G   33G  30% /
/dev/sdb1             2.0T  840G  1.1T  42% /mnt/data-spoke`);
                } else {
                    sbLog(`Command not recognized.`, 'warn');
                }
            }
        } catch (err) {
            sbLog(`[CLI-ERROR] Errore di esecuzione del comando: ${err.message}`, 'warn');
        } finally {
            // Re-enable input and controls
            const updatedButtons = sbAvailableCommands.querySelectorAll('button');
            updatedButtons.forEach(btn => btn.disabled = false);
            sbCmdInput.disabled = false;
            sbCmdInput.focus({ preventScroll: true });
        }
    }
});
