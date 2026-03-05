import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { JobOfferService } from '../job-offer.service';
import { JobOffer } from '../../../../models/job-offer.model';

@Component({
  selector: 'app-job-offer-list',
  templateUrl: './job-offer-list.component.html',
  styleUrls: ['./job-offer-list.component.css']
})
export class JobOfferListComponent implements OnInit, AfterViewInit {
  @Output() addNew = new EventEmitter<void>();
  @Output() edit = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['jobTitle', 'company', 'industry', 'location', 'salaryRange', 'actions'];
  dataSource = new MatTableDataSource<JobOffer>([]);
  searchForm: FormGroup;

  constructor(
    private jobOfferService: JobOfferService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      company: [''],
      industry: [''],
      location: [''],
      minSalary: [0],
      maxSalary: [200000]
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAll(): void {
    this.jobOfferService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => this.snackBar.open('Error loading offers', 'Close', { duration: 3000 })
    });
  }

  search(): void {
    const { company, industry, location, minSalary, maxSalary } = this.searchForm.value;
    const comp = company?.trim() || undefined;
    const ind = industry?.trim() || undefined;
    const loc = location?.trim() || undefined;
    const min = minSalary != null ? Number(minSalary) : undefined;
    const max = maxSalary != null ? Number(maxSalary) : undefined;

    this.jobOfferService.searchAll(comp, ind, loc, min, max).subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => this.snackBar.open('Search failed', 'Close', { duration: 3000 })
    });
  }

  resetSearch(): void {
    this.searchForm.reset({
      company: '',
      industry: '',
      location: '',
      minSalary: 0,
      maxSalary: 200000
    });
    this.loadAll();
  }

  onAddNew(): void {
    this.addNew.emit();
  }

  onEdit(id: number): void {
    this.edit.emit(id);
  }

  delete(id: number): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.jobOfferService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Offer deleted', 'Close', { duration: 2000 });
          this.loadAll();
        },
        error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 })
      });
    }
  }
}
