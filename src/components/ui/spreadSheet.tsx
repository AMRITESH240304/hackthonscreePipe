import React, { useState, useEffect, useRef } from 'react';
import Spreadsheet from 'react-spreadsheet';
import { Note } from '../meeting-history/types';
import { improveNote } from '../live-transcription/hooks/ai-create-note';
import type { Settings } from "@screenpipe/browser";

// Define the type for each cell in the spreadsheet
interface Cell {
  value: string | number | null;
  readOnly?: boolean;
  className?: string;
}

interface MeetingNotesSpreadsheetProps {
  notes: Note[];
  context: string;
  title?: string;
  settings: Settings;
  maxHeight?: string | number;
}

const MeetingNotesSpreadsheet: React.FC<MeetingNotesSpreadsheetProps> = ({ 
  notes, 
  context, 
  title, 
  settings,
  maxHeight = '70vh' // Default max height
}) => {
  // State for spreadsheet data
  const [data, setData] = useState<Cell[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const spreadsheetContainerRef = useRef<HTMLDivElement>(null);
  
  // Convert notes to spreadsheet format when notes prop changes
  useEffect(() => {
    const formatNotesForSpreadsheet = async () => {
      setIsLoading(true);
      
      // Create header row
      const spreadsheetData: Cell[][] = [
        [
          { value: 'Timestamp', readOnly: true, className: 'header-cell' },
          { value: 'Original Note', readOnly: true, className: 'header-cell' },
          { value: 'Improved Note', readOnly: false, className: 'header-cell' },
          { value: 'Category', readOnly: false, className: 'header-cell' }
        ]
      ];
      
      // Process each note
      for (const note of notes) {
        const noteContext = {
          note,
          context,
          title
        };
        
        let improvedNoteText = note.text;
        
        try {
          // Use the AI to improve the note
          improvedNoteText = await improveNote(noteContext, settings);
        } catch (error) {
          console.error("Failed to improve note:", error);
        }
        
        // Format timestamp (assuming note.timestamp is in milliseconds)
        const timestamp = note.timestamp 
          ? new Date(note.timestamp).toLocaleTimeString()
          : 'N/A';
        
        // Add row for this note - remove tags reference
        spreadsheetData.push([
          { value: timestamp, readOnly: true },
          { value: note.text, readOnly: true },
          { value: improvedNoteText, readOnly: false },
          { value: '', readOnly: false } // Empty category/tag field that can be filled in
        ]);
      }
      
      setData(spreadsheetData);
      setIsLoading(false);
    };
    
    if (notes && notes.length > 0) {
      formatNotesForSpreadsheet();
    }
  }, [notes, context, title, settings]);

  // Handle changes to the spreadsheet
  const handleChange = (newData: Cell[][]) => {
    setData(newData);
    
    // Here you could implement logic to save edited notes or categories
    // For example, saving updated notes back to your application state
  };

  // Export the spreadsheet data as CSV
  const exportToCsv = () => {
    const csvContent = data.map(row => 
      row.map(cell => `"${cell.value || ''}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title || 'meeting'}_notes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scroll to bottom functionality
  const scrollToBottom = () => {
    if (spreadsheetContainerRef.current) {
      spreadsheetContainerRef.current.scrollTop = spreadsheetContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="meeting-notes-spreadsheet">
      <div className="spreadsheet-header">
        <h2>{title || 'Meeting Notes'}</h2>
        <div className="spreadsheet-actions">
          <button 
            onClick={scrollToBottom}
            className="scroll-button"
            disabled={data.length <= 1}
          >
            Scroll to Bottom
          </button>
          <button 
            onClick={exportToCsv}
            disabled={data.length <= 1}
            className="export-button"
          >
            Export as CSV
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">Processing meeting notes...</div>
      ) : (
        data.length > 0 ? (
          <div 
            ref={spreadsheetContainerRef}
            className="spreadsheet-container"
            style={{ 
              maxHeight, 
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <Spreadsheet 
              data={data}
            //   onChange={handleChange}
              className="meeting-notes-table"
            />
          </div>
        ) : (
          <div className="no-data-message">No meeting notes available</div>
        )
      )}
    </div>
  );
};

export default MeetingNotesSpreadsheet;