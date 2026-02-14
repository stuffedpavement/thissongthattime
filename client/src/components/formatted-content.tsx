interface FormattedContentProps {
  content: string;
  className?: string;
}

export default function FormattedContent({ content, className = "" }: FormattedContentProps) {
  const formatQAContent = (text: string) => {
    const lines = text.split('\n');
    
    // Check if this looks like Q&A content
    const hasQuestions = lines.some(line => 
      line.trim().endsWith('?') && 
      line.trim().length > 10 &&
      !line.trim().startsWith('A:') && 
      !line.trim().startsWith('-')
    );

    if (!hasQuestions) {
      // Regular content - preserve line breaks
      return (
        <div className={className} style={{ whiteSpace: 'pre-line' }}>
          {text}
        </div>
      );
    }

    // Q&A format - render with bold questions
    return (
      <div className={className}>
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') {
            return <br key={index} />;
          }

          // Check if this line is a question
          const isQuestion = trimmedLine.endsWith('?') && 
                            trimmedLine.length > 10 &&
                            !trimmedLine.startsWith('A:') && 
                            !trimmedLine.startsWith('-');

          if (isQuestion) {
            return (
              <div key={index}>
                <strong className="text-gray-900 block mb-1">{trimmedLine}</strong>
              </div>
            );
          } else if (trimmedLine) {
            return (
              <div key={index} className="text-gray-700 mb-3">
                {trimmedLine}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };

  return formatQAContent(content);
}