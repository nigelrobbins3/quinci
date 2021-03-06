/* @flow */
const React = require("react");
const { TriangleRightIcon } = require("react-octicons");
const ansiUp = require("ansi_up").default;
const Job = require("../../job");
const Padding = require("./Padding");
const LabelWithIcon = require("./LabelWithIcon");

const ansiUpInstance = new ansiUp();

type Props = {
  job: Job,
  isSelected: boolean,
};

module.exports = class JobRunOutput extends React.Component<Props> {
  render() {
    const { job, isSelected } = this.props;

    return (
      <details open={isSelected}>
        <summary style={{ display: "flex" }}>
          <LabelWithIcon
            noMargin
            label="Output"
            icon={<TriangleRightIcon className="details-icon" />}
          />
        </summary>
        <Padding top={8}>
          <pre
            style={{
              padding: "8px",
              backgroundColor: "#262626",
              color: "white",
              overflow: "auto",
              maxHeight: "50vh",
            }}
          >
            <code
              dangerouslySetInnerHTML={{
                __html: ansiUpInstance.ansi_to_html(job.runResult.output),
              }}
            />
          </pre>
        </Padding>
      </details>
    );
  }
};
