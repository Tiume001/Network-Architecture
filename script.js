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
                    } else {
                        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

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
