
const JsonDisplay = ({ data }) => {
  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <pre>
      <code>
        {formattedJson}
      </code>
    </pre>
  );
}

export default JsonDisplay;