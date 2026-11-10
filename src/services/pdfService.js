import { jsPDF } from 'jspdf';
import { SOCIETY_INFO } from '../data/keralaSocietyData';

/**
 * Generates an official downloadable Daily Patrol Summary PDF report.
 */
export function generateDailyPatrolReport(data) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const {
    robotState,
    dogs = [],
    alertZones = [],
    distanceCovered = 8.42,
    incidentsResolved = 3
  } = data;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Header background
  doc.setFillColor(13, 148, 136); // Teal #0d9488
  doc.rect(0, 0, 210, 36, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PawPatrol™ Autonomous Canine Report', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Daily Surveillance & Welfare Audit • ${SOCIETY_INFO.name}`, 14, 26);
  doc.text(`Generated: ${todayStr}`, 14, 31);

  // Society Meta Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 28, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 28, 3, 3, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Sector Information', 20, 50);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Location: ${SOCIETY_INFO.locality}`, 20, 56);
  doc.text(`Robot Unit: ${robotState?.robotId || SOCIETY_INFO.robotId} | Base Station: ${SOCIETY_INFO.baseStation.name}`, 20, 62);
  doc.text(`Battery Reserve: ${robotState?.battery || 88}% | Current Mode: ${robotState?.mode || 'Patrolling'}`, 120, 62);

  // Key KPI Cards
  const kpis = [
    { label: 'Distance Covered', val: `${distanceCovered} km`, color: [13, 148, 136] },
    { label: 'Dogs Identified', val: `${dogs.length} Canines`, color: [249, 115, 22] },
    { label: 'Registered Pets', val: `${dogs.filter(d => d.category === 'known').length} Dogs`, color: [16, 185, 129] },
    { label: 'Active Alerts', val: `${alertZones.length} Zones`, color: [239, 68, 68] }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + (idx * 47);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, 75, 43, 22, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 4, 82);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, x + 4, 91);
  });

  // Section: Detected Dogs Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Canine Census & Recognition Log', 14, 107);

  // Table header
  doc.setFillColor(226, 232, 240);
  doc.rect(14, 111, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('CANINE NAME', 18, 116);
  doc.text('BREED / CLASSIFICATION', 60, 116);
  doc.text('STATUS', 110, 116);
  doc.text('CONFIDENCE', 140, 116);
  doc.text('OWNER / VILLA', 165, 116);

  let currentY = 122;
  dogs.slice(0, 10).forEach((dog, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY - 4, 182, 7, 'F');
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    const nameStr = `${dog.name} ${dog.category === 'stray' ? '(Stray)' : ''}`;
    doc.text(nameStr.substring(0, 24), 18, currentY);
    doc.text(dog.breed.substring(0, 26), 60, currentY);

    if (dog.category === 'known') {
      doc.setTextColor(16, 185, 129);
      doc.text('Registered', 110, currentY);
    } else if (dog.category === 'stray') {
      doc.setTextColor(239, 68, 68);
      doc.text('Stray / Unclaimed', 110, currentY);
    } else {
      doc.setTextColor(245, 158, 11);
      doc.text('Unknown Visitor', 110, currentY);
    }

    doc.setTextColor(15, 23, 42);
    doc.text(`${Math.round(dog.confidence * 100)}%`, 142, currentY);

    const ownerStr = dog.owner ? `${dog.owner.villa || dog.owner.name}` : 'Unassigned';
    doc.text(ownerStr.substring(0, 20), 165, currentY);

    currentY += 7;
  });

  // Section: Alert & Safety Summary
  currentY += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Safety, Aggression Zones & Escorts', 14, currentY);

  currentY += 6;
  alertZones.forEach((zone) => {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(14, currentY, 182, 14, 2, 2, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, currentY, 182, 14, 2, 2, 'D');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(`[ALERT ZONE: ${zone.name}] - ${zone.severity.toUpperCase()} RISK`, 18, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 29, 29);
    doc.text(`Reason: ${zone.reason} • Recommended Detour: ${zone.safeDetourSuggestion}`, 18, currentY + 10);

    currentY += 17;
  });

  // Footer & Official Stamp
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('PawPatrol™ Autonomous Society Systems • Confidential & Automated Audit Report', 14, 280);
  doc.text(`Palm Meadows Resident Welfare Association (PMRWA), Kakkanad, Kochi`, 14, 285);
  doc.text('Page 1 of 1', 185, 285);

  // Save PDF file
  const filename = `PawPatrol_Daily_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

