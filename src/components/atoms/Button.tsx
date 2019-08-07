import * as React from "react";

import styled from "@emotion/styled";

// const StyledButton = styled.button`
// color: turquoise;
// `;

const StyledButton = styled.button<Props>`
  color: ${props => (props.primary ? "hotpink" : "turquoise")};
`;

type Props = { primary?: boolean };
const Button: React.FC<Props> = ({ ...rest }) => {
  return <StyledButton {...rest} />;
};

export default Button;
