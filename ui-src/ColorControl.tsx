import Control, { ControlProps } from './Control';

const ColorControl = ({
  children,
  small,
  ...props
}: {
  small?: boolean;
} & ControlProps) => {
  const colorIcon = (
    <div style={{
      width: 24,
      height: 24,
      borderRadius: 100,
      background: props.value as string,
      cursor: 'pointer'
    }} />
  );
  return (
    <Control
      {...props}
      icon={small}
      as="input"
      type="color"
      replacement={
        <div className="c-control__input h-pointer">
          { small 
            ? colorIcon
            : props.value 
          }
        </div>
      }
      right={
        small
        ? null
        : colorIcon
      }
      rightReadOnly={false} />
  )
}

export default ColorControl;