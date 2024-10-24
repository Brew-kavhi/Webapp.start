export interface FieldScheme {
	name: string;
	label: string;
	type: InputType;
	required: boolean;
	autocomplete?: string;
	minlength?: Number;
	min?: Number;
	max?: Number;
	validate?: (value: any) => [boolean, string];
	options?: array;
}
export enum InputType {
	Password = 'password',
	Email = 'email',
	Phone = 'phone',
	Text = 'text',
	Number = 'number',
	PassworConfirmation = 'password-confirmation',
	Range = 'range',
	Interval = 'interval',
	Select = 'select',
	Radio = 'radio',
	Checkbox = 'checkbox',
	Color = 'color',
	Date = 'date',
	DateTime = 'datetime-local',
	File = 'file',
	Month = 'month',
	Time = 'time',
	Url = 'url',
	Week = 'week',
}
