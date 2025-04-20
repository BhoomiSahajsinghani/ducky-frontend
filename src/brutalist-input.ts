enum SubmitState {
  Default = 0,
  Working,
  Done
}

class BrutalistInput {
  /** Form used for this component */
  el: HTMLFormElement | null;
  /** Timeout function for state changes */
  timeout?: NodeJS.Timeout;
  /** Current state of the form */
  private _state = SubmitState.Default;
  /** Whether the input is invalid */
  private _inputInvalid = true;

  /**
   * @param el CSS selector of the form
   */
  constructor(el: string) {
    this.el = document.querySelector(el);
    this.el?.addEventListener("input", this.inputValidate.bind(this));
    this.el?.addEventListener("submit", this.submit.bind(this));
  }

  get state() {
    return this._state;
  }

  set state(value: SubmitState) {
    this._state = value;

    const shouldBeDisabled = value > SubmitState.Default;

    this.toggleDisabled(shouldBeDisabled);
    this.stateDisplay(value);
  }

  get inputInvalid() {
    return this._inputInvalid;
  }

  set inputInvalid(value: boolean) {
    this._inputInvalid = value;
    this.el?.querySelector('input')?.setAttribute("aria-invalid", `${value}`);

    const submitBtn = this.el?.querySelector('button[name="send"]') as HTMLButtonElement;

    if (submitBtn) {
      submitBtn.disabled = value;
    }
  }

  /** Validate the input. */
  inputValidate(): void {
    const input = this.el?.querySelector('input') as HTMLInputElement;
    const inputValue = input?.value || '';

    this.inputInvalid = !inputValue.length;
  }

  /**
   * Display how the form should appear under a specific state.
   * @param index Index of the state
   */
  stateDisplay(index: SubmitState): void {
    this.el?.setAttribute("data-state", `${index}`);
  }

  /**
   * Send the supplied input (simulated) and reset the form.
   * @param e Submit event
   */
  async submit(e: Event): Promise<void> {
    e.preventDefault();

    if (this.state !== SubmitState.Default || this.inputInvalid) {
      return;
    }

    const activeElement = document.activeElement as HTMLButtonElement | HTMLInputElement;
    activeElement?.blur();

    this.state = SubmitState.Working;

    const delayWorking = 1300;
    const delayDone = 2000;

    return await new Promise<void>(resolve => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => { 
        this.state = SubmitState.Done;
        resolve();
      }, delayWorking);
    }).then(() => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.state = SubmitState.Default;
        this.inputInvalid = true;
        this.el?.reset();
      }, delayDone);
    });
  }

  /**
   * Enable or disable the form controls.
   * @param disabled Whether or not the controls should be disabled
   */
  toggleDisabled(disabled: boolean): void {
    const input = this.el?.querySelector('input') as HTMLInputElement;
    const submitBtn = this.el?.querySelector('button[name="send"]') as HTMLButtonElement;

    if (input) {
      input.disabled = disabled;
    }

    if (submitBtn) {
      submitBtn.disabled = disabled;
    }
  }
}

export default BrutalistInput; 