import { Widget } from '@/store/dashboardStore';
import { DataSource } from '@/store/dataStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface DashboardExport {
  name: string;
  widgets: Widget[];
  dataSources: DataSource[];
  version: string;
  createdAt: string;
}

export type ExportFormat = 'json' | 'pdf' | 'image';

// Save dashboard configuration to a file
export const exportDashboard = (
  name: string, 
  widgets: Widget[], 
  dataSources: DataSource[],
  format: ExportFormat = 'json'
): Promise<void> => {
  if (format === 'json') {
    return exportAsJson(name, widgets, dataSources);
  } else if (format === 'pdf') {
    return exportAsPdf(name);
  } else if (format === 'image') {
    return exportAsImage(name);
  }
  
  // Default to JSON if format not recognized
  return exportAsJson(name, widgets, dataSources);
};

// Export dashboard as JSON
const exportAsJson = (
  name: string, 
  widgets: Widget[], 
  dataSources: DataSource[]
): Promise<void> => {
  return new Promise((resolve) => {
    const dashboardExport: DashboardExport = {
      name,
      widgets,
      dataSources,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(dashboardExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${name.toLowerCase().replace(/\s+/g, '-')}-dashboard.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    resolve();
  });
};

// Get a screenshot of the dashboard using html2canvas
const getDashboardScreenshot = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const dashboardElement = document.getElementById('dashboard-grid');
      if (!dashboardElement) {
        reject(new Error('Dashboard element not found'));
        return;
      }

      // Create a loading indicator
      const loadingElement = document.createElement('div');
      loadingElement.style.position = 'fixed';
      loadingElement.style.top = '0';
      loadingElement.style.left = '0';
      loadingElement.style.right = '0';
      loadingElement.style.bottom = '0';
      loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      loadingElement.style.zIndex = '9999';
      loadingElement.style.display = 'flex';
      loadingElement.style.justifyContent = 'center';
      loadingElement.style.alignItems = 'center';
      loadingElement.style.fontSize = '20px';
      loadingElement.style.color = '#3b82f6';
      loadingElement.innerText = 'Capturing dashboard...';
      document.body.appendChild(loadingElement);

      // Pre-process the dashboard to handle any color issues BEFORE html2canvas capture
      preprocessDashboardForCapture()
        .then(() => {
          // Now use html2canvas on the preprocessed dashboard
          return html2canvas(dashboardElement, {
            backgroundColor: 'white',
            allowTaint: true, 
            useCORS: true,
            scale: 2,
            logging: false,
            ignoreElements: (element) => {
              // Skip elements that might cause issues
              if (element.classList && 
                  (element.classList.contains('hidden') || 
                   element.classList.contains('invisible'))) {
                return true;
              }
              return false;
            },
            onclone: (clonedDocument) => {
              // Additional processing for the cloned document
              const clonedDashboard = clonedDocument.getElementById('dashboard-grid');
              if (clonedDashboard) {
                // Ensure all charts and graphs are visible
                clonedDashboard.style.overflow = 'visible';
                
                // Force all SVG and charts to fixed dimensions
                const chartElements = clonedDashboard.querySelectorAll('.recharts-wrapper, svg');
                chartElements.forEach(chart => {
                  if (chart instanceof HTMLElement) {
                    // Force visibility
                    chart.style.visibility = 'visible';
                    chart.style.display = 'block';
                    // Fix dimensions
                    if (chart.offsetWidth > 0 && chart.offsetHeight > 0) {
                      chart.style.width = `${chart.offsetWidth}px`;
                      chart.style.height = `${chart.offsetHeight}px`;
                    } else {
                      // Set default sizes if dimensions are 0
                      chart.style.width = '100%';
                      chart.style.height = '200px';
                    }
                  }
                });
                
                // Process all elements to replace any remaining OKLCH colors
                const allElements = clonedDocument.querySelectorAll('*');
                allElements.forEach(el => {
                  if (el instanceof HTMLElement) {
                    // Check computed style for OKLCH
                    try {
                      const style = window.getComputedStyle(el);
                      // Apply safe colors for any element with OKLCH
                      if (style.color.includes('oklch')) {
                        el.style.color = '#333333';
                      }
                      if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
                        el.style.backgroundColor = '#ffffff';
                      }
                      if (style.borderColor && style.borderColor.includes('oklch')) {
                        el.style.borderColor = '#e5e7eb';
                      }
                      
                      // Handle SVG-specific properties
                      if (el.tagName === 'path' || el.tagName === 'circle' || el.tagName === 'rect') {
                        if (el.getAttribute('fill') && el.getAttribute('fill')?.includes('oklch')) {
                          el.setAttribute('fill', '#3b82f6');
                        }
                        if (el.getAttribute('stroke') && el.getAttribute('stroke')?.includes('oklch')) {
                          el.setAttribute('stroke', '#3b82f6');
                        }
                      }
                      
                      // Replace inline styles containing OKLCH
                      if (el.getAttribute('style') && el.getAttribute('style')?.includes('oklch')) {
                        let styleAttr = el.getAttribute('style') || '';
                        styleAttr = styleAttr.replace(/oklch\([^)]+\)/g, '#333333');
                        el.setAttribute('style', styleAttr);
                      }
                    } catch (e) {
                      // Ignore errors in style processing
                      console.log('Style processing error, continuing...', e);
                    }
                  }
                });
              }
            }
          });
        })
        .then(canvas => {
          // Remove loading indicator
          document.body.removeChild(loadingElement);
          
          // Remove any temporary style elements we added
          const tempStyles = document.querySelectorAll('style[data-export-temp="true"]');
          tempStyles.forEach(el => el.parentNode?.removeChild(el));
          
          // Return the canvas data URL
          resolve(canvas.toDataURL('image/png'));
        })
        .catch(error => {
          // Clean up
          document.body.removeChild(loadingElement);
          
          // Remove any temporary style elements we added
          const tempStyles = document.querySelectorAll('style[data-export-temp="true"]');
          tempStyles.forEach(el => el.parentNode?.removeChild(el));
          
          console.error('Error capturing dashboard:', error);
          
          // Try our last resort capture method
          console.log('Attempting fallback capture method...');
          tryAggressiveCapture(dashboardElement)
            .then(dataUrl => resolve(dataUrl))
            .catch(err => reject(err));
        });
    } catch (error) {
      console.error('Fatal error in dashboard capture:', error);
      reject(error);
    }
  });
};

// Pre-process dashboard for capture by fixing color issues directly in the DOM
const preprocessDashboardForCapture = async (): Promise<void> => {
  return new Promise((resolve) => {
    // Create temporary stylesheet to override problematic styles
    const tempStyleElement = document.createElement('style');
    tempStyleElement.setAttribute('data-export-temp', 'true');
    tempStyleElement.textContent = `
      /* Global color overrides for html2canvas compatibility */
      [style*="oklch"] { color: #333333 !important; background-color: #ffffff !important; }
      
      /* Chart specific overrides */
      .recharts-wrapper {
        overflow: visible !important;
        height: auto !important;
        min-height: 200px !important;
      }
      
      .recharts-surface {
        overflow: visible !important;
      }
      
      /* Override specific chart element colors to ensure visibility */
      .recharts-default-color-0 { fill: #3b82f6 !important; stroke: #3b82f6 !important; }
      .recharts-default-color-1 { fill: #10b981 !important; stroke: #10b981 !important; }
      .recharts-default-color-2 { fill: #f59e0b !important; stroke: #f59e0b !important; }
      .recharts-default-color-3 { fill: #ef4444 !important; stroke: #ef4444 !important; }
      .recharts-default-color-4 { fill: #6366f1 !important; stroke: #6366f1 !important; }
      .recharts-default-color-5 { fill: #8b5cf6 !important; stroke: #8b5cf6 !important; }
      .recharts-default-color-6 { fill: #ec4899 !important; stroke: #ec4899 !important; }
      .recharts-default-color-7 { fill: #14b8a6 !important; stroke: #14b8a6 !important; }
      
      /* Make text visible */
      .recharts-text { fill: #333333 !important; }
      
      /* Make grid lines visible */
      .recharts-cartesian-grid-horizontal line, 
      .recharts-cartesian-grid-vertical line {
        stroke: #d1d5db !important;
      }
      
      /* Fix background colors that might be using OKLCH */
      .bg-white, .bg-background { background-color: #ffffff !important; }
      .bg-primary { background-color: #3b82f6 !important; }
      .bg-secondary { background-color: #6b7280 !important; }
      .bg-success { background-color: #10b981 !important; }
      .bg-danger { background-color: #ef4444 !important; }
      .bg-warning { background-color: #f59e0b !important; }
      .bg-info { background-color: #6366f1 !important; }
      
      /* Fix text colors */
      .text-primary { color: #3b82f6 !important; }
      .text-secondary { color: #6b7280 !important; }
      .text-success { color: #10b981 !important; }
      .text-danger { color: #ef4444 !important; }
      .text-warning { color: #f59e0b !important; }
      .text-info { color: #6366f1 !important; }
      
      /* Specific fixes for tables */
      table {
        border-collapse: collapse !important;
        border: 1px solid #e5e7eb !important;
        width: 100% !important;
      }
      
      th, td {
        border: 1px solid #e5e7eb !important;
        padding: 8px !important;
        text-align: left !important;
        color: #333333 !important;
        background-color: #ffffff !important;
      }
      
      th {
        background-color: #f9fafb !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
      }
      
      tr:nth-child(even) {
        background-color: #f9fafb !important;
      }
      
      /* Make sure all charts and tables are visible */
      .widget-container {
        overflow: visible !important;
        height: auto !important;
        min-height: 100px !important;
      }
    `;
    document.head.appendChild(tempStyleElement);
    
    // Process chart elements specifically
    try {
      // Find all chart containers
      const chartContainers = document.querySelectorAll('.recharts-wrapper');
      chartContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          // Ensure charts have proper dimensions
          if (container.offsetHeight < 50) {
            container.style.height = '200px';
          }
          
          // Force SVG elements to be visible
          const svgElements = container.querySelectorAll('svg');
          svgElements.forEach(svg => {
            if (svg instanceof SVGElement) {
              svg.style.visibility = 'visible';
              svg.style.overflow = 'visible';
              
              // Process all SVG children to fix OKLCH issues
              const svgChildren = svg.querySelectorAll('*');
              svgChildren.forEach(el => {
                // Replace any fill or stroke attributes that use OKLCH
                if (el.getAttribute('fill') && el.getAttribute('fill')?.includes('oklch')) {
                  el.setAttribute('fill', '#3b82f6');
                }
                if (el.getAttribute('stroke') && el.getAttribute('stroke')?.includes('oklch')) {
                  el.setAttribute('stroke', '#3b82f6');
                }
              });
            }
          });
        }
      });
      
      // Special handling for tables
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        // Add standard styles to table
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.border = '1px solid #e5e7eb';
        
        // Process all table headers and cells
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
          if (cell instanceof HTMLElement) {
            // Set standard styles
            cell.style.border = '1px solid #e5e7eb';
            cell.style.padding = '8px';
            cell.style.textAlign = 'left';
            
            // Set colors based on cell type
            if (cell.tagName === 'TH') {
              cell.style.backgroundColor = '#f9fafb';
              cell.style.fontWeight = '600';
              cell.style.color = '#1f2937';
            } else {
              cell.style.backgroundColor = '#ffffff';
              cell.style.color = '#333333';
            }
          }
        });
        
        // Alternate row colors
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
          if (index % 2 === 1) { // Even rows (0-indexed)
            row.style.backgroundColor = '#f9fafb';
          }
        });
      });
    } catch (e) {
      console.log('Element preprocessing error (non-fatal):', e);
    }
    
    // Allow a small delay for styles to apply before proceeding
    setTimeout(() => {
      resolve();
    }, 300); // Longer delay to ensure styles are fully applied
  });
};

// More aggressive approach if html2canvas fails with OKLCH colors
const tryAggressiveCapture = async (element: HTMLElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Using aggressive capture method');
      
      // Create a canvas for a basic fallback render
      const rect = element.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      canvas.width = rect.width * 2; // For high resolution 
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some text explaining we're using a fallback method
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Fallback Dashboard Export', canvas.width/2, 40);
      
      // Add note about what happened
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Using fallback method due to OKLCH color compatibility issues.', canvas.width/2, 70);
      
      // Try to use html2canvas one more time with aggressive settings
      html2canvas(element, {
        backgroundColor: 'white',
        allowTaint: true,
        useCORS: true,
        scale: 1, // Lower scale for better compatibility
        logging: false,
        ignoreElements: (el) => {
          // Ignore elements that might cause OKLCH issues
          if (el instanceof HTMLElement) {
            try {
              const style = window.getComputedStyle(el);
              return !!(
                style.color.includes('oklch') || 
                (style.backgroundColor && style.backgroundColor.includes('oklch')) ||
                (style.borderColor && style.borderColor.includes('oklch'))
              );
            } catch (e) {
              // If we can't check styles, don't ignore the element
              return false;
            }
          }
          return false;
        }
      }).then(renderedCanvas => {
        // Success! Use the rendered canvas
        const dataUrl = renderedCanvas.toDataURL('image/png');
        resolve(dataUrl);
      }).catch(error => {
        // If html2canvas still fails, use our basic canvas with text
        console.log('Final html2canvas attempt failed:', error);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      });
      
    } catch (error) {
      console.error('Aggressive capture failed completely:', error);
      tryFallbackCapture(element)
        .then(dataUrl => resolve(dataUrl))
        .catch(err => reject(err));
    }
  });
};

// Fallback method if html2canvas fails - this is a last resort
const tryFallbackCapture = async (element: HTMLElement): Promise<string> => {
  try {
    console.log('Using last resort fallback capture method');
    
    // Create a simplified version of the dashboard based on actual widgets
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width * 2; // For high resolution
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add dashboard title
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Dashboard Export (Simplified View)', canvas.width/2, 40);
    
    // Draw note about export limitations
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Note: This is a simplified view. For full data export, use JSON format.', canvas.width/2, 70);
    
    // Try to capture at least some information about the widgets
    try {
      // Find all widget containers
      const widgets = element.querySelectorAll('.recharts-wrapper, .widget-container');
      if (widgets.length > 0) {
        ctx.fillStyle = '#4b5563';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${widgets.length} widget(s) detected in dashboard`, canvas.width/2, 100);
        
        // List widget titles if we can find them
        let y = 130;
        const widgetTitles = element.querySelectorAll('.widget-drag-handle');
        widgetTitles.forEach((title, index) => {
          ctx.fillStyle = '#4b5563';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Widget ${index + 1}: ${title.textContent || 'Untitled'}`, canvas.width/2, y);
          y += 20;
        });
      }
    } catch (widgetError) {
      console.log('Could not extract widget information:', widgetError);
    }
    
    return canvas.toDataURL('image/png');
  } catch (error: unknown) {
    console.error('Fallback capture failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Unable to capture dashboard: ' + errorMessage);
  }
};

// Export dashboard as PDF
const exportAsPdf = (name: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Add a loading indicator to the DOM
      const loadingElement = document.createElement('div');
      loadingElement.style.position = 'fixed';
      loadingElement.style.top = '0';
      loadingElement.style.left = '0';
      loadingElement.style.right = '0';
      loadingElement.style.bottom = '0';
      loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      loadingElement.style.zIndex = '9999';
      loadingElement.style.display = 'flex';
      loadingElement.style.justifyContent = 'center';
      loadingElement.style.alignItems = 'center';
      loadingElement.style.fontSize = '20px';
      loadingElement.style.color = '#3b82f6';
      loadingElement.innerText = 'Generating PDF...';
      document.body.appendChild(loadingElement);

      // Get dashboard screenshot
      const dashboardImage = await getDashboardScreenshot();
      
      // Create a new image element to get accurate dimensions
      const img = new Image();
      img.src = dashboardImage;
      
      // Wait for the image to load to get its dimensions
      await new Promise<void>((imgResolve) => {
        img.onload = () => imgResolve();
      });
      
      // Create a PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      // Get PDF page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate available content area (leaving margins)
      const contentWidth = pdfWidth - 20; // 10mm margin on each side
      const contentHeight = pdfHeight - 25; // 15mm margin on top, 10mm on bottom
      
      // Calculate scaling factor to fit width
      const scale = contentWidth / img.width;
      const scaledHeight = img.height * scale;
      
      // Add title to first page
      pdf.setFontSize(16);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text(name, pdfWidth / 2, 15, { align: 'center' });
      
      // Add creation date
      const today = new Date().toLocaleDateString();
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // Slate color
      pdf.text(`Generated on ${today}`, pdfWidth - 10, 10, { align: 'right' });
      
      // Check if we need multiple pages
      if (scaledHeight > contentHeight) {
        // This dashboard needs multiple pages
        // Calculate how many slices we need
        const numSlices = Math.ceil(scaledHeight / contentHeight);
        
        // Update loading indicator
        loadingElement.innerText = `Generating ${numSlices}-page PDF...`;
        console.log(`Dashboard requires ${numSlices} pages`);
        
        // Divide image into slices for each page
        for (let i = 0; i < numSlices; i++) {
          // If not first page, add a new page
          if (i > 0) {
            pdf.addPage();
          }
          
          // Calculate slice position and dimensions
          const yPos = i === 0 ? 20 : 10; // First page has title, others start at top
          
          // Create a temporary canvas to slice the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Could not create canvas context');
          }
          
          // Set canvas dimensions for this slice
          canvas.width = img.width;
          canvas.height = Math.min(contentHeight / scale, img.height - (i * contentHeight / scale));
          
          // Draw the appropriate portion of the image to the canvas
          ctx.drawImage(
            img,
            0, // Source x
            i * (contentHeight / scale), // Source y - start from where the last slice ended
            img.width, // Source width
            canvas.height, // Source height
            0, // Destination x
            0, // Destination y
            canvas.width, // Destination width
            canvas.height // Destination height
          );
          
          // Get this slice as a data URL
          const sliceDataUrl = canvas.toDataURL('image/png');
          
          // Add the slice to the PDF
          pdf.addImage(
            sliceDataUrl,
            'PNG',
            10, // x position - left margin
            yPos, // y position
            contentWidth,
            Math.min(contentHeight, (canvas.height * scale))
          );
          
          // Add page number
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(`Page ${i + 1} of ${numSlices}`, pdfWidth - 10, pdfHeight - 5, { align: 'right' });
        }
      } else {
        // Single page is sufficient - center the image
        const yPos = 20; // Below the title
        
        // Add the image to the PDF
        pdf.addImage(
          dashboardImage,
          'PNG',
          10, // x position - left margin
          yPos, // y position - below title
          contentWidth,
          scaledHeight
        );
        
        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Page 1 of 1', pdfWidth - 10, pdfHeight - 5, { align: 'right' });
      }
      
      // Remove the loading indicator
      document.body.removeChild(loadingElement);
      
      // Save the PDF
      const filename = `${name.toLowerCase().replace(/\s+/g, '-')}-dashboard.pdf`;
      pdf.save(filename);
      
      resolve();
    } catch (error) {
      // Remove the loading indicator if there's an error
      const loadingElement = document.querySelector('div[style*="position: fixed"]');
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
      }
      
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

// Export dashboard as Image (PNG)
const exportAsImage = (name: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Add a loading indicator to the DOM
      const loadingElement = document.createElement('div');
      loadingElement.style.position = 'fixed';
      loadingElement.style.top = '0';
      loadingElement.style.left = '0';
      loadingElement.style.right = '0';
      loadingElement.style.bottom = '0';
      loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      loadingElement.style.zIndex = '9999';
      loadingElement.style.display = 'flex';
      loadingElement.style.justifyContent = 'center';
      loadingElement.style.alignItems = 'center';
      loadingElement.style.fontSize = '20px';
      loadingElement.style.color = '#3b82f6';
      loadingElement.innerText = 'Generating image...';
      document.body.appendChild(loadingElement);

      // Get dashboard screenshot
      const dashboardImage = await getDashboardScreenshot();
      
      // Create a download link and trigger download
      const link = document.createElement('a');
      link.href = dashboardImage;
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-dashboard.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Remove the loading indicator
      document.body.removeChild(loadingElement);
      
      resolve();
    } catch (error) {
      // Remove the loading indicator if there's an error
      const loadingElement = document.querySelector('div[style*="position: fixed"]');
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
      }
      
      console.error('Error generating image:', error);
      reject(error);
    }
  });
};

// Load dashboard configuration from a file
export const importDashboard = (file: File): Promise<DashboardExport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        // Validate the imported data
        if (!jsonData.widgets || !jsonData.dataSources || !jsonData.version) {
          throw new Error('Invalid dashboard file format');
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}; 