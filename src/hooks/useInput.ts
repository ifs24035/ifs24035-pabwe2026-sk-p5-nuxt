import { ref, type Ref } from "vue";

/**
 * Hook kecil untuk two-way binding input form.
 * Mengembalikan [nilai, handler event, setter langsung].
 */
export default function useInput(
  defaultValue: string = ""
): [Ref<string>, (event: any) => void, (val: string) => void] {
  const value = ref<string>(defaultValue);

  function handleValueChange(event: any): void {
    value.value = event?.target?.value !== undefined ? event.target.value : event;
  }

  function setValue(val: string): void {
    value.value = val;
  }

  return [value, handleValueChange, setValue];
}
